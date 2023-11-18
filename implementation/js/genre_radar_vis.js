
class RadarVis {

    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;

        this.initVis();
    }


    initVis() {
        let vis = this;

        // define margins
        vis.margin = {top: 20, right: 0, bottom: 20, left: 30};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .append("g")
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // init scales
        vis.scale = d3.scaleLinear()
            .domain([0, 1])
            .range([0, vis.width / 3 - 2]);
        vis.ticks = [.25, .5, .75, 1];

        // draw axis circles
        vis.svg.selectAll("circle")
            .data(vis.ticks)
            .enter()
            .append("circle")
            .attr("cx", vis.width / 2)
            .attr("cy", vis.height / 2)
            .attr("fill", "none")
            .attr("stroke", "gray")
            .attr("r", d => vis.scale(d));

        // get axis data
        vis.features = ['acousticness', 'instrumentalness', 'loudness', 'speechiness', 'tempo', 'valence']
        vis.featureData = vis.features.map((f, i) => {
            let angle = (Math.PI / 2) + (2 * Math.PI * i / vis.features.length);
            return {
                "name": f,
                "angle": angle,
                "line_coord": vis.angleToCoordinate(angle, 1, vis),
                "label_coord": vis.angleToCoordinate(angle, 1.1, vis)
            };
        });

        // draw axis line
        vis.svg.selectAll("line")
            .data(vis.featureData)
            .enter()
            .append("line")
            .attr("x1", vis.width / 2)
            .attr("y1", vis.height / 2)
            .attr("x2", d => d.line_coord.x)
            .attr("y2", d => d.line_coord.y)
            .attr("stroke","black");

        // draw axis labels
        vis.labels = vis.svg.selectAll(".axislabel")
            .data(vis.featureData);
        vis.labels
            .enter()
            .append("text")
            .merge(vis.labels)
            .attr("x", d => d.label_coord.x)
            .attr("y", d => d.label_coord.y + 5)
            .attr("text-anchor", function(d) {
                if (d.label_coord.x < vis.width * 0.25) { return "end"; }
                else if (d.label_coord.x < vis.width * 0.75) { return "middle"; }
                else { return "start"; }
            })
            .text(d => d.name);
        vis.labels.exit().remove();

        // initialize helpers for paths
        vis.line = d3.line()
            .x(d => d.x)
            .y(d => d.y);
        vis.pathGroup = vis.svg.append("g")
            .attr("class", "radar-path");

        vis.updateVis();
    }


    updateVis() {
        let vis = this;

        // draw the path element
        vis.paths = vis.pathGroup
            .selectAll("path")
            .data([vis.data]);

        vis.paths
            .enter()
            .append("path")
            .merge(vis.paths)
            .datum(d => vis.getPathCoordinates(d, vis))
            .attr("d", vis.line)
            .attr("fill", "#74729a")
            .attr("stroke-opacity", 1)
            .attr("opacity", 0.8);

    }


    handleMouseOver(element, event, d, vis) {

    }


    handleMouseOut(element, event, d, vis) {

    }


    angleToCoordinate(angle, value, vis){
        let x = Math.cos(angle) * vis.scale(value);
        let y = Math.sin(angle) * vis.scale(value);
        return {
            "x": vis.width / 2 + x,
            "y": vis.height / 2 - y
        };
    }

    getPathCoordinates(data, vis) {
        let coordinates = [];
        for (var i = 0; i < vis.features.length; i++){
            let ft_name = `${vis.features[i]}_scaled`;
            let angle = (Math.PI / 2) + (2 * Math.PI * i / vis.features.length);
            coordinates.push(vis.angleToCoordinate(angle, data[ft_name], vis));
        }
        return coordinates;
    }

}
