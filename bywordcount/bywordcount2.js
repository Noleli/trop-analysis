$(document).ready(function() {
	$.get("bywordcount.csv", function(d) {
		// console.log(d);
		$("#data").text(d);
		// nvd3_tags.options.x_end = 32;
		nvd3_tags.renderAll();
	});
 });