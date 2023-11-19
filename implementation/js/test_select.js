
class TestSelection {
    constructor(_parentElement, _mbtiData, _genreData) {
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

        // TODO: add genre instructions

        // TODO: add genre buttons

        // TODO: add mbti instructions

        // TODO: add mbti buttons

        // TODO: add comfirm button

        // initialize selected items
        vis.selectedGenres = [];
        vis.selectedMBTI = [];

        vis.wrangleData();
    }


    wrangleData() {
        let vis = this;

        // TODO: group MBTI data by MBTI
        vis.displayData = vis.mbtiData;

        vis.updateVis();
    }


    updateVis() {
        let vis = this;

        // TODO: put buttons of selected items to front


    }

    handleMouseClickOnConfirm(event, vis) {

        let testVis;
        // selected genre, display MBTI rankings
        if (vis.selectedGenres.length > 0 && vis.selectedGenres.length <= 3) {
            testVis = new TestMBTIVis("test_vis", vis.displayData, vis.genreData);
        // selected MBTI, display genre rankings
        } else if (vis.selectedMBTI.length == 1) {
            testVis = new TestGenreVis("test_vis", vis.displayData, vis.genreData)
        }
    }
}