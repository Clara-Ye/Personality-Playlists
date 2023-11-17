
class GenreVis {

    constructor(_parentElement, _genreData, _artistData, _songData) {
        this.parentElement = _parentElement;
        this.genreData = _genreData;
        this.artistData = _artistData;
        this.songData = _songData;

        this.initVis();
    }


    initVis() {
        let vis = this;

        // define margins
        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .append("g")
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add dummy rectangle for event listening
        vis.svg.append("rect")
            .attr("x", -vis.margin.left)
            .attr("y", -vis.margin.top)
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr("fill", "rgba(0,0,0,0)")
            .on('click', function(event, d) { vis.handleMainMouseClick(this, event, d, vis); } )

        // initialize icon dimensions and icon group
        vis.radius = (vis.width - vis.margin.left - vis.margin.right) / 15;
        vis.hSpacing = (vis.width - vis.margin.left - vis.margin.right) / 15 * 1.25;
        vis.vSpacing = (vis.height - vis.margin.top - vis.margin.bottom - 6 * vis.radius) / 6;
        vis.genreIcons = vis.svg.append("g")
            .attr("class", "genre-icon");

        // add tooltip container
        // TODO: add section for artists and songs
        vis.tooltip = d3.select("body")
            .append('div')
            .attr('class', "tooltip")
            .attr('id', 'genre-tooltip')
            .html(`
                <div class="row" id="genre-tooltip-container">
                    <div class="col-12">
                        <div id="genre-name-container">Genre Name</div>
                        <!-- radar chart -->
                        <div id="radar-chart-container"></div>
                        <!-- description -->
                        <div id="genre-intro-container">Genre intro</div>
                    </div>
                </div>`);

        // enable hovering for displaying tooltips
        vis.hoverEnabled = true;

        // init radar chart drawing area
        vis.tooltip.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.tooltip.width = vis.width / 2;
        vis.tooltip.height = vis.height * 0.75;
        vis.tooltip.svgWidth = vis.tooltip.width - vis.tooltip.margin.left - vis.tooltip.margin.right;
        vis.tooltip.svgHeight = (vis.tooltip.height - vis.tooltip.margin.top - vis.tooltip.margin.bottom) / 2;

        document.getElementById("genre-tooltip-container").style.width = `${vis.tooltip.width}px`;
        document.getElementById("genre-tooltip-container").style.height = `${vis.tooltip.height}px`;

        vis.tooltip.svg = d3.select("#radar-chart-container")
            .append("svg")
            .attr("width", vis.tooltip.svgWidth)
            .attr("height", vis.tooltip.svgHeight)
            .append("g")
            .attr('transform', `translate (${vis.tooltip.margin.left}, ${vis.tooltip.margin.top})`);

        // draw radar chart axis

        // init scales
        vis.tooltip.scale = d3.scaleLinear()
            .domain([0, 1])
            .range([0, vis.tooltip.svgHeight / 3 - 2]);
        vis.tooltip.ticks = [.25, .5, .75, 1];

        // draw radar chart circles
        vis.tooltip.svg.selectAll("circle")
            .data(vis.tooltip.ticks)
            .join(
                enter => enter.append("circle")
                    .attr("cx", vis.tooltip.svgWidth / 2  - vis.tooltip.margin.left)
                    .attr("cy", vis.tooltip.svgHeight / 2 - vis.tooltip.margin.top)
                    .attr("fill", "none")
                    .attr("stroke", "gray")
                    .attr("r", d => vis.tooltip.scale(d))
            );

        // get axis data
        vis.tooltip.features = ['acousticness', 'instrumentalness', 'loudness', 'speechiness', 'tempo', 'valence']
        vis.tooltip.featureData = vis.tooltip.features.map((f, i) => {
            let angle = (Math.PI / 2) + (2 * Math.PI * i / vis.tooltip.features.length);
            return {
                "name": f,
                "angle": angle,
                "line_coord": vis.angleToCoordinate(angle, 1, vis),
                "label_coord": vis.angleToCoordinate(angle, 1.1, vis)
            };
        });

        // draw axis line
        vis.tooltip.svg.selectAll("line")
            .data(vis.tooltip.featureData)
            .enter()
            .append("line")
            .attr("x1", vis.tooltip.svgWidth / 2  - vis.tooltip.margin.left)
            .attr("y1", vis.tooltip.svgHeight / 2  - vis.tooltip.margin.top)
            .attr("x2", d => d.line_coord.x)
            .attr("y2", d => d.line_coord.y)
            .attr("stroke","black");

        // draw axis label
        vis.tooltip.labels = vis.tooltip.svg.selectAll(".axislabel")
            .data(vis.tooltip.featureData);
        vis.tooltip.labels
            .enter()
            .append("text")
            .merge(vis.tooltip.labels)
            .attr("x", d => d.label_coord.x)
            .attr("y", d => d.label_coord.y + 5)
            .attr("text-anchor", function(d) {
                if (d.label_coord.x < vis.tooltip.svgWidth / 3) { return "end"; }
                else if (d.label_coord.x < vis.tooltip.svgWidth / 2.1) { return "middle"; }
                else { return "start"; }
            })
            .text(d => d.name);
        vis.tooltip.labels.exit().remove();

        // initialize helpers for paths
        vis.tooltip.line = d3.line()
            .x(d => d.x)
            .y(d => d.y);
        vis.tooltip.pathGroup = vis.tooltip.svg.append("g")
            .attr("class", "radar-path");

        vis.wrangleData();
    }


    wrangleData() {
        let vis = this;

        // TODO: pick 3 artists for each genre and 3 songs for each artist
        vis.displayData = vis.genreData;
        console.log(vis.displayData);

        vis.updateVis();
    }


    updateVis() {
        let vis = this;

        // draw genre icons
        // TODO: switch to svg icons placeholders
        vis.genreIcon = vis.genreIcons.selectAll("circle")
            .data(vis.displayData);
        vis.genreIcon.enter()
            .append("circle")
            .merge(vis.genreIcon)
            .attr("cx", function(d,i) {
                if (i < 4 || i >= 9) { return vis.hSpacing / 2 + 2 * vis.radius + (i % 4) * (2 * vis.radius + vis.hSpacing); }
                else { return (i % 5) * (2 * vis.radius + vis.hSpacing) + vis.radius; }
            })
            .attr("cy", function(d,i) {
                if (i < 4) { return 2 * vis.vSpacing + vis.radius; }
                else if (i < 9) { return 3 * vis.vSpacing + 3 * vis.radius; }
                else { return 4 * vis.vSpacing + 5 * vis.radius; }
            })
            .attr("r", vis.radius)
            .attr("fill", "#74729a")
            .attr('stroke-width', '0px');

        // add event listeners
        vis.genreIcons.selectAll("circle")
            .on('mouseover', function(event, d) { vis.handleCircleMouseOver(this, event, d, vis); } )
            .on('mouseout', function(event, d) { vis.handleCircleMouseOut(this, event, d, vis); } )
            .on('click', function(event, d) { vis.handleCircleMouseClick(this, event, d, vis); } );

    }

    handleCircleMouseOver(element, event, d, vis) {

        if (vis.hoverEnabled) {

            // highlight hovered element
            d3.select(element)
                .attr('stroke-width', '3px')
                .attr('stroke', '#1e1f22');

            // draw radar chart on tooltip
            vis.drawRadarChart(d, vis);

            // display tooltip
            vis.tooltip
                .style("opacity", 1)
                .style("left", function() {
                    if (event.pageX < (vis.width + vis.margin.left + vis.margin.right) / 2) { return `${event.pageX + 10}px`; }
                    else { return `${event.pageX - vis.width/2 - 10}px`; }
                })
                .style("top", function() {
                    if (event.pageY < vis.height / 2.5) { return `${event.pageY}px`; }
                    else if (event.pageY < vis.height / 1.2) {return `${vis.height/4}px`; }
                    else {return `${event.pageY - vis.height/2}px`; }
                });
        }
    }

    handleCircleMouseOut(element, event, d, vis) {

        if (vis.hoverEnabled) {
            // revert element highlight
            d3.select(element).attr('stroke-width', '0px');
            // hide tooltip
            vis.tooltip.style("opacity", 0);
        }
    }

    handleCircleMouseClick(element, event, d, vis) {

        if (vis.hoverEnabled) {
            // highlight clicked element
            d3.select(element)
                .attr('stroke-width', '3px')
                .attr('stroke', '#c67ca2');

            console.log(element);

            // disable hover responses
            vis.hoverEnabled = false;

            // draw radar chart on tooltip
            vis.drawRadarChart(d, vis);

            // display tooltip
            vis.tooltip
                .style("opacity", 1)
                .style("left", function() {
                    if (event.pageX < (vis.width + vis.margin.left + vis.margin.right) / 2) { return `${event.pageX + 10}px`; }
                    else { return `${event.pageX - vis.width/2 - 10}px`; }
                })
                .style("top", function() {
                    if (event.pageY < vis.height / 2.5) { return `${event.pageY}px`; }
                    else if (event.pageY < vis.height / 1.2) {return `${vis.height/4}px`; }
                    else {return `${event.pageY - vis.height/2}px`; }
                });

        } else {
            // enable hover responses
            vis.hoverEnabled = true;
            // revert element highlight and tooltip
            vis.handleCircleMouseOut(element, event, d, vis);
            vis.updateVis();
        }
    }

    handleMainMouseClick(element, event, d, vis) {
        if (!vis.hoverEnabled) {
            // enable hover responses
            vis.hoverEnabled = true;
            vis.tooltip.style("opacity", 0);
            vis.updateVis();
        }
    }

    handleTooltipMouseOver(element, event, d, vis) {

    }

    handleTooltipMouseOut(element, event, d, vis) {

    }

    handleTooltipMouseClick(event, d) {

    }

    drawRadarChart(data, vis) {

        // draw the path element
        vis.tooltip.paths = vis.tooltip.pathGroup
            .selectAll("path")
            .data([data]);

        vis.tooltip.paths
            .enter()
            .append("path")
            .merge(vis.tooltip.paths)
            .datum(d => vis.getPathCoordinates(d, vis))
            .attr("d", vis.tooltip.line)
            .attr("stroke-width", 1)
            .attr("stroke", "gray")
            .attr("fill", "#74729a")
            .attr("stroke-opacity", 1)
            .attr("opacity", 0.75);
    }

    angleToCoordinate(angle, value, vis){
        let x = Math.cos(angle) * vis.tooltip.scale(value);
        let y = Math.sin(angle) * vis.tooltip.scale(value);
        return {
            "x": vis.tooltip.svgWidth / 2 - vis.tooltip.margin.left + x,
            "y": vis.tooltip.svgHeight / 2 - vis.tooltip.margin.top - y
        };
    }

    getPathCoordinates(data, vis) {
        console.log(data);
        let coordinates = [];
        for (var i = 0; i < vis.tooltip.features.length; i++){
            let ft_name = `${vis.tooltip.features[i]}_scaled`;
            let angle = (Math.PI / 2) + (2 * Math.PI * i / vis.tooltip.features.length);
            coordinates.push(vis.angleToCoordinate(angle, data[ft_name], vis));
        }
        return coordinates;
    }

}
