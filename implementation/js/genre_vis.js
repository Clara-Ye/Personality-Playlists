
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

        vis.wrangleData();
    }


    wrangleData() {
        let vis = this;

        vis.updateVis();
    }


    updateVis() {
        let vis = this;

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
