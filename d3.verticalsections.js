/*global d3:false */

var verticalsections = function(args){

	var defaults = {
		//If max_x/y is not defined 
		//Number of Columns
		max_x: 0,
		//Number of Rows
		max_y: 0,

		columns:[],
		min:[],
		max:[],

		data:[]
	};

	var width, height, mySelection, svg;

	var x;
	var y = [];
	var area = [];

	var config = d3.tools.extend(defaults, args);

	//If the maximum is not defined, the maximum of the dataset is being used
	if(config.max_x < 1 || config.max_y < 1){
		config.max_y = config.data.length;
		config.max_x = config.data[0].length;
	}

	//Get the overall maximum and minimum for all rows and columns
	for(var c in config.columns){
		config.max[c] = config.min[c] = undefined;
	}

	for(var d in config.data){
		for(var c in config.columns){
			var max = d3.max(config.data[d], function(item){ return item[config.columns[c]]; });
			if(max > config.max[c] || config.max[c] === undefined){
				config.max[c] = max;
			}

			var min = d3.min(config.data[d], function(item){ return item[config.columns[c]]; });
			if(min < config.min[c] || config.min[c] === undefined){
				config.min[c] = min;
			}
		}
	}

	function my(selection){
		mySelection = selection;

		//Get width and Height of the selection
		width = mySelection.node().getBoundingClientRect().width;
		height = mySelection.node().getBoundingClientRect().height;

		//Scale for x across all columns
		x = d3.scale.linear().range([0, width]).domain([0, config.max_x]);

		//Scale for y for one row for each data column
		for(var c in config.columns){
			y[c] = d3.scale.linear().range([height/config.max_y, 0]).domain([config.min[c], config.max[c]]);
		}

		//Area for each data column
		area[0] = d3.svg.area()
			.x(function(d) { return x(d.x); })
			.y0(height/config.max_y)
			.y1(function(d) { return y[0](d[config.columns[0]]); });

		area[1] = d3.svg.area()
			.x(function(d) { return x(d.x); })
			.y0(height/config.max_y)
			.y1(function(d) { return y[1](d[config.columns[1]]); });

		//Add SVG Container
		svg = selection.append("svg")
			.attr("width", width)
			.attr("height", height);

		//Add defs for gradient
		var defs = svg.append("defs");


		for(var i = 0; i<config.data.length; i++){

			var linearGradient = defs.append("linearGradient")
				.attr("id", "grad_"+i)
				.attr("x1", 0)
				.attr("y1", 0)
				.attr("x2", 1)
				.attr("y2", 0);

			for(var j = 0; j<config.data[i].length; j++){
				linearGradient.append("stop")
					.attr("offset", Math.round((100.0/(config.data[i].length-1))*j)+"%")
					.attr("style", "stop-color:rgb("+Math.round(255.0/config.max[2]*config.data[i][j][config.columns[2]])+",0,"+Math.round(255.0-(255.0/config.max[2]*config.data[i][j][config.columns[2]]))+");stop-opacity:0.8");
				}

			svg.append("path")
				.attr("transform", "translate(0,"+((height/config.max_y)*i)+")")
				.datum(config.data[i])
				.attr("class", "area "+config.columns[1])
				.attr("fill", "url(#grad_"+i+")")
				.attr("d", area[1]);

			svg.append("path")
				.attr("transform", "translate(0,"+((height/config.max_y)*i)+")")
				.datum(config.data[i])
				.attr("class", "area "+config.columns[0])
				.attr("d", area[0]);
		}

	}

	return my;

};