
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

        // initialize icon dimensions and icon group
        vis.radius = (vis.width - vis.margin.left - vis.margin.right) / 15;
        vis.hSpacing = (vis.width - vis.margin.left - vis.margin.right) / 15 * 1.25;
        vis.vSpacing = (vis.height - vis.margin.top - vis.margin.bottom - 6 * vis.radius) / 6;
        vis.genreIcons = vis.svg.append("g")
            .attr("class", "genre-icon");

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
            .attr("fill", "#74729a");

    }

    handleMainMouseOver(event, d) {

    }

    handleMainMouseOut(event, d) {

    }

    handleMainMouseClick(event, d) {

    }

    handleTooltipMouseOver(event, d) {

    }

    handleTooltipMouseOut(event, d) {

    }

    handleTooltipMouseClick(event, d) {

    }

}
