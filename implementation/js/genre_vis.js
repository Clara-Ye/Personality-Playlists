
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

        // add small tooltip (hover) container
        vis.tooltipSmall = d3.select("body")
            .append('div')
            .attr('class', "tooltip")
            .attr('id', 'genre-tooltip-small')
            .html(`
                <div class="row" id="genre-tooltip-small-container">
                    <div class="col-12">
                        <!-- genre name -->
                        <div id="genre-tooltip-small-name-container">Genre Name</div>
                        <!-- description -->
                        <div id="genre-tooltip-small-intro-container">
                            Ah, the enchanting world of music genres – where the beats are as diverse as my excuses for not doing thorough research. Today, we embark on a sonic journey through a genre that's so mysterious, even I couldn't bother finding out what it is. Picture this as the placeholder for your soon-to-be-discovered musical passion. It's like the suspense of a blind date, but with fewer awkward conversations and more notes playing hard to get. 
                        </div>
                    </div>
                </div>`);
        // set attributes
        vis.tooltipSmall.style('opacity', 0);
        vis.tooltipWidth = d3.min([vis.width / 2, 400]);
        document.getElementById("genre-tooltip-small-container").style.width = `${vis.tooltipWidth}px`;

        // add large tooltip (click) container
        vis.tooltipLarge = d3.select("body")
            .append('div')
            .attr('class', "tooltip")
            .attr('id', 'genre-tooltip-large')
            .html(`
                <div class="row" id="genre-tooltip-large-container">
                    <div class="col-12">
                        <!-- headline -->
                        <div class="row">
                            <!-- genre name -->
                            <div class="col-11">
                                <div id="genre-tooltip-large-name-container">Genre Name</div>                           
                            </div>
                            <!-- exit button -->
                            <div class="col-1">
                                <div class="exit-button" id="genre-tooltip-large-exit-button">
                                    <i class="fas fa-times"></i>
                                </div>                                
                            </div>
                        </div>
                        <!-- content -->
                        <div class="row" style="width: 100%; height: 100%">
                            <!-- radar chart -->
                            <div class="col-7">
                                <div id="radar-vis" style="width: 100%; height: 100%"></div>
                            </div>
                            <!-- description -->
                            <div class="col-5">
                                <div id="genre-tooltip-large-intro-container">
                                    Ah, the enchanting world of music genres – where the beats are as diverse as my excuses for not doing thorough research. Today, we embark on a sonic journey through a genre that's so mysterious, even I couldn't bother finding out what it is. Picture this as the placeholder for your soon-to-be-discovered musical passion. It's like the suspense of a blind date, but with fewer awkward conversations and more notes playing hard to get. 
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`);

        // set attributes
        vis.tooltipLarge.style('opacity', 0);
        document.getElementById("genre-tooltip-large-container").style.width = `${vis.width}px`;
        document.getElementById("genre-tooltip-large-container").style.height = `${vis.height * 0.7}px`;

        // create radar chart instance
        vis.radarVis = new RadarVis("radar-vis", vis.genreData[0]);

        // register exit icon to event listener
        document.getElementById("genre-tooltip-large-exit-button")
            .addEventListener("click", function(event) { vis.handleMouseClickOnExit(event, vis); } );

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
            .on('mouseover', function(event, d) { vis.handleMouseOver(this, event, d, vis); } )
            .on('mouseout', function(event, d) { vis.handleMouseOut(this, event, d, vis); } )
            .on('click', function(event, d) { vis.handleMouseClick(this, event, d, vis); } );

    }


    handleMouseOver(element, event, d, vis) {

        // make the element vibrate
        vis.shakeIcon(element, vis, d.tempo, d.loudness_scaled);

        // TODO: play sample track

        // highlight hovered element
        d3.select(element)
            .attr('stroke-width', '3px')
            .attr('stroke', '#1e1f22');

        // update tooltip label
        d3.select("#genre-tooltip-small-name-container")
            .text(d.genre.charAt(0).toUpperCase() + d.genre.substr(1)); // upper case first letter

        // TODO: update genre description

        // get circle location
        let cx = parseFloat(d3.select(element).attr('cx')) + vis.margin.left,
            cy = parseFloat(d3.select(element).attr('cy')) + vis.margin.top;

        // get tooltip height
        vis.tooltipHeight = document.getElementById("genre-tooltip-small-container").offsetHeight;

        // display tooltip
        vis.tooltipSmall
            .style("opacity", 1)
            .style("left", function() {
                if (cx <= vis.width/2) { return `${cx + vis.hSpacing / 2 + 3 * vis.radius}px`; }
                else { return `${cx + vis.hSpacing / 2 - vis.tooltipWidth}px` }
            })
            .style("top", `${cy - vis.tooltipHeight/2}px`);

    }

    handleMouseOut(element, event, d, vis) {

        // make the element stop vibrate
        vis.stopIcon(element, vis, d.tempo);

        // TODO: stop sample track

        // revert element highlight
        d3.select(element)
            .attr('stroke-width', '0px');

        // hide tooltip
        vis.tooltipSmall
            .style("opacity", 0)
            .style("left", `-1080px`);

    }


    handleMouseClick(element, event, d, vis) {

        // update radar chart
        vis.radarVis.data = d;
        vis.radarVis.updateVis();

        // update tooltip label
        d3.select("#genre-tooltip-large-name-container")
            .text(d.genre.charAt(0).toUpperCase() + d.genre.substr(1)); // upper case first letter

        // TODO: update genre description

        // display tooltip
        vis.tooltipLarge
            .style("opacity", 1)
            .style("left", `${vis.margin.left  + vis.height * 0.15}px`)
            .style("top", `${vis.margin.top + vis.height * 0.15}px`);

    }


    handleMouseClickOnExit(event, vis) {

        // hide tooltip
        vis.tooltipLarge
            .style("opacity", 0)
            .style("left", `-1080px`);
    }

    shakeIcon(element, vis, bpm, loudness) {

        // get animation attributes
        let frequency = bpm / 60;
        let amplitude = loudness**2 * 20;

        // vibrate
        d3.select(element)
            .transition()
            .duration(1000 / frequency)
            .attr("transform", "translate(0," + amplitude + ")")
            .transition()
            .duration(1000 / frequency)
            .attr("transform", "translate(0," + -amplitude + ")")
            // keep vibrating
            .on("end", function() { vis.shakeIcon(element, vis, bpm, loudness); } );

    }

    stopIcon(element, vis, bpm) {

        d3.select(element)
            .transition()
            .duration(1000 / (bpm / 60))
            .attr("transform", "translate(0,0)");

    }

}
