
class TestSelection {
    constructor(_parentElement, _mbtiData, _genreData) {
        this.parentElement = _parentElement;
        this.mbtiData = _mbtiData;
        this.genreData = _genreData;

        this.genreList = [];
        this.genreData.forEach(d => this.genreList.push(d.genre));
        this.genreList.sort((a,b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
        this.mbtiList = ["INTJ", "INTP", "ENTJ", "ENTP",
                         "INFJ", "INFP", "ENFJ", "ENFP",
                         "ISTJ", "ISFJ", "ESTJ", "ESFJ",
                         "ISTP", "ISFP", "ESTP", "ESFP"]

        // TODO: group MBTI data by MBTI
        this.displayData = this.mbtiData;

        this.initVis();
    }

    initVis() {
        let vis = this;

        // define margins
        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // set up page structure

        d3.select(`#${vis.parentElement}`)
            .append('div')
            .attr("class", "row")
            .attr("id", "instruction-row")
            .html(`<div class="col-12" id="test-main-instruction">
                        <div>This is a very informative instruction.</div>
                   </div>`);

        vis.testRow = d3.select(`#${vis.parentElement}`)
            .append('div')
            .attr("class", "row")
            .attr('id', 'test-row');

        vis.buttonRow = d3.select(`#${vis.parentElement}`)
            .append('div')
            .attr("class", "row")
            .attr("id", "button-row");

        vis.genreTestCol = vis.testRow.append("div")
            .attr("class", "col-6")
            .attr("id", "genre-test-col");

        vis.mbtiTestCol = vis.testRow.append("div")
            .attr("class", "col-6")
            .attr("id", "mbti-test-col");

        // add instructions

        vis.genreInstruction = vis.genreTestCol.append("div")
            .attr("id", "genre-instruction")
            .html(`<div>This is a very informative instruction.</div>`);

        vis.genreIcon = vis.genreTestCol.append("img")
            .attr("src", "img/random/music_icon.svg")
            .style("width", "50%");

        vis.mbtiInstruction = vis.mbtiTestCol.append("div")
            .attr("id", "genre-instruction")
            .html(`<div>This is a very informative instruction.</div>`);

        vis.mbtiIcon = vis.mbtiTestCol.append("img")
            .attr("src", "img/random/mbti_icon.svg")
            .style("width", "50%");

        // add selection buttons

        vis.genreButtonGroup = vis.genreTestCol
            .append("div")
            .attr("id", "genre-button-container")
            .style("width", "50%")
            .append("g")
            .attr("class", "button genre-button");

        vis.mbtiButtonGroup = vis.mbtiTestCol
            .append("div")
            .attr("id", "genre-button-container")
            .style("width", "50%")
            .append("g")
            .attr("class", "button mbti-button");

        // add confirm button

        vis.confirmButton = vis.buttonRow.append("button")
            .text("Confirm")
            .attr("class", "button")
            .attr("id", "confirm-button")
            .on("click", function(event) { vis.handleMouseClickOnConfirm(event, vis) });


        // initialize selected items
        vis.selectedGenres = [];
        vis.selectedMbti = [];

        vis.wrangleData();
    }


    wrangleData() {
        let vis = this;

        // TODO: move selected items to front
        vis.displayGenreList = vis.genreList;
        vis.displayMbtiList = vis.mbtiList;

        vis.updateVis();
    }


    updateVis() {
        let vis = this;

        console.log(vis.displayGenreList)

        // add genre selection buttons
        vis.genreButtons = vis.genreButtonGroup.selectAll(".genre-button")
            .data(vis.displayGenreList);
        vis.genreButtons.enter()
            .append("button")
            .attr("class", "genre-button")
            .merge(vis.genreButtons)
            .text(d => d);

        // add mbti selection buttons
        vis.mbtiButtons = vis.mbtiButtonGroup.selectAll(".mbti-button")
            .data(vis.displayMbtiList);
        vis.mbtiButtons.enter()
            .append("button")
            .attr("class", "genre-button")
            .merge(vis.mbtiButtons)
            .text(d => d);
    }


    handleMouseClickOnConfirm(event, vis) {

        let testVis;
        // selected genre, display MBTI rankings
        if (vis.selectedGenres.length > 0 && vis.selectedGenres.length <= 3) {
            testVis = new TestMBTIVis("test_vis", vis.displayData, vis.genreData);
        // selected MBTI, display genre rankings
        } else if (vis.selectedMbti.length == 1) {
            testVis = new TestGenreVis("test_vis", vis.displayData, vis.genreData)
        } else {
            console.log("error in selection");
        }
    }
}