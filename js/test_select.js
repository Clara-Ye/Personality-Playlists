
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

        this.testCompleted = false;

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
        vis.displayGenreList = [...vis.selectedGenres, ...vis.genreList.filter(d => !vis.selectedGenres.includes(d))];
        vis.displayMbtiList = vis.mbtiList;

        vis.updateVis();
    }


    updateVis() {
        let vis = this;

        // add genre selection buttons
        vis.genreButtons = vis.genreButtonGroup.selectAll(".genre-button")
            .data(vis.displayGenreList);
        vis.genreButtons.enter()
            .append("button")
            .attr("class", "genre-button")
            .merge(vis.genreButtons)
            .text(d => d)
            .style("background-color", d => {
                if (vis.selectedGenres.includes(d)) { return "#74729a"; }
                else { return "#ffffff" }
            })
            .on("click", function(event, d)  { vis.handleMouseClickOnGenreButton(this, event, d, vis); } );

        // add mbti selection buttons
        vis.mbtiButtons = vis.mbtiButtonGroup.selectAll(".mbti-button")
            .data(vis.displayMbtiList);
        vis.mbtiButtons.enter()
            .append("button")
            .attr("class", "mbti-button")
            .merge(vis.mbtiButtons)
            .text(d => d)
            .style("background-color", d => {
                if (vis.selectedMbti.includes(d)) { return "#74729a"; }
                else { return "#ffffff" }
            })
            .on("click", function(event, d)  { vis.handleMouseClickOnMbtiButton(this, event, d, vis); } );
        vis.mbtiButtons.exit().remove();
    }


    handleMouseClickOnGenreButton(element, event, d, vis) {

        // clear mbti selection
        vis.selectedMbti = [];

        // current selection in existing selection
        if (vis.selectedGenres.includes(d)) {
            // clear current selection
            vis.selectedGenres.splice(vis.selectedGenres.indexOf(d), 1);
            // current selection not in existing selection
        } else {
            // <3 existing selection
            if (vis.selectedGenres.length < 3) {
                // add current selection to end of list
                vis.selectedGenres.push(d);
            // >=3 existing selection
            } else {
                // replace last element with current selection
                vis.selectedGenres.pop();
                vis.selectedGenres.push(d);
            }
        }

        vis.wrangleData();

    }


    handleMouseClickOnMbtiButton(element, event, d, vis) {

        // clear genre selection
        vis.selectedGenres = [];

        // no existing selection, or current selection is different from existing selection
        if (vis.selectedMbti.length == 0 || vis.selectedMbti[0] != d) {
            // update selection to be current selection
            vis.selectedMbti = [d];
        // current selection is same as existing selection
        } else {
            // clear current selection
            vis.selectedMbti = [];
        }

        vis.updateVis();
    }


    handleMouseClickOnConfirm(event, vis) {

        // first time doing the test
        if (!vis.testCompleted) {

            // mark test as completed
            vis.testCompleted = true;

            // display appropriate result visualization
            let testVis;
            // selected genre, display MBTI rankings
            if (vis.selectedGenres.length > 0 && vis.selectedGenres.length <= 3) {
                testVis = new TestMbtiVis("test_vis", vis.displayData, vis.genreData, vis.selectedGenres);
            // selected MBTI, display genre rankings
            } else if (vis.selectedMbti.length == 1) {
                testVis = new TestGenreVis("test_vis", vis.displayData, vis.genreData, vis.selectedMbti);
            } else {
                console.log("error in selection");
            }

            // scroll to result visualization
            document.getElementById("test_vis").scrollIntoView({
                behavior: 'smooth'
            });

            // disable all buttons
            vis.confirmButton.on("click", null);
            vis.genreButtonGroup.selectAll(".genre-button")
                .on("click", null);
            vis.mbtiButtonGroup.selectAll(".mbti-button")
                .on("click", null);
        }

        // TODO: some signal for no second test?

    }
}