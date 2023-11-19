
class TestGenreVis {
    constructor(_parentElement, _genreData, _mbtiData) {
        this.parentElement = _parentElement;
        this.mbtiData = _mbtiData;
        this.genreData = _genreData;

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

        // TODO: add center line

        // TODO: add proceed button

        // TODO: initialize tooltip

        vis.wrangleData();
    }


    wrangleData() {
        let vis = this;

        // TODO: pivot data into one row per genre and sort by rating

        vis.updateVis();
    }


    updateVis() {
        let vis = this;

        // TODO: add bubbles

    }

    // TODO: display tooltip on hover

    // TODO: hide tooltip on mouseout

    // TODO: handle click on proceed button

}