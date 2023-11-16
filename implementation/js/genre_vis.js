
class GenreVis {

    constructor(_parentElement, _data, _eventHandler) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.eventHandler = _eventHandler;

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
}
