
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
        vis.tooltip = d3.select("body")
            .append('div')
            .attr('class', "tooltip")
            .attr('id', 'genreTooltip');

        // enable hovering for displaying tooltips
        vis.hoverEnabled = true;

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
            console.log(d)

            // highlight hovered element
            d3.select(element)
                .attr('stroke-width', '3px')
                .attr('stroke', '#1e1f22');

            // display tooltip
            vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px")
                .html(`
                 <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                     <h3> ${d.genre} <h3>                   
                 </div>`);
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

            // disable hover responses
            vis.hoverEnabled = false;

            // display tooltip
            vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px")
                .html(`
                 <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                     <h3> ${d.genre} <h3>                   
                 </div>`);
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

}
