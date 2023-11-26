class mbtiDetailVis {

    constructor(_parentElement, _data,) {
        this.parentElement = _parentElement;
        this.data = _data;

        this.selectedLetters = [];

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Create buttons for each MBTI letter
        vis.mbtiLetters = ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'];
        vis.mbtiFullNames = {
            'E': 'Extroverted',
            'I': 'Introverted',
            'S': 'Sensing',
            'N': 'Intuition',
            'T': 'Thinking',
            'F': 'Feeling',
            'J': 'Judging',
            'P': 'Perceiving'
        };

        vis.mbtiPairs = {
            'E': 'I', 'I': 'E',
            'S': 'N', 'N': 'S',
            'T': 'F', 'F': 'T',
            'J': 'P', 'P': 'J'
        };
        vis.order = ['E', 'I', 'N', 'S', 'T', 'F', 'J', 'P'];
        vis.buttonContainer = d3.select('#' + vis.parentElement).append('div')
            .attr('class', 'button-container');

        vis.mbtiLetters.forEach(letter => {
            let fullName = vis.mbtiFullNames[letter];
            // let buttonText = `<strong>${letter}</strong>${fullName.slice(1)}`;
            let buttonText = `${fullName}`;

            let randomIndex = Math.floor(Math.random() * 8);
            let imageUrl = `img/sketch/rect_${randomIndex + 1}.png`;
            console.log(imageUrl);

            vis.buttonContainer.append('button')
                .attr('class', 'mbti-letter-button')
                .attr('id', `button-${letter}`)
                .html(buttonText)
                .style('background', `url('${imageUrl}') no-repeat center center`)
                .style("background-size", "100% 100%")
                .on('click', function() { vis.letterClicked(letter); })
                // .on('click', function() { console.log(`Button ${letter} clicked`); });
        });

        // Prepare a container for the selected MBTI image
        vis.imageContainer = d3.select('#' + vis.parentElement).append('div')
            .attr('class', 'image-container');

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.displayData = this.data;

        vis.updateVis();
    }

    updateVis() {
        let vis = this;
    }

    letterClicked(letter) {
        let vis = this;

        // Deselect the paired letter if it's currently selected
        let pairedLetter = vis.mbtiPairs[letter];
        let pairedIndex = vis.selectedLetters.indexOf(pairedLetter);
        if (pairedIndex > -1) {
            vis.selectedLetters.splice(pairedIndex, 1);
        }

        // Toggle the clicked letter
        let index = vis.selectedLetters.indexOf(letter);
        if (index > -1) {
            vis.selectedLetters.splice(index, 1);
        } else {
            vis.selectedLetters.push(letter);
        }

        // Sort the selected letters according to the MBTI order
        vis.selectedLetters.sort((a, b) => vis.order.indexOf(a) - vis.order.indexOf(b));

        // Update button classes to reflect current state
        vis.mbtiLetters.forEach(l => {
            d3.select(`#button-${l}`).classed('mbti-letter-button-selected', vis.selectedLetters.includes(l));
        });

        if (vis.selectedLetters.length === 4) {
            this.updateImageDisplay();
        }
    }

    updateImageDisplay() {
        let vis = this;

        // Clear any previous image or message
        vis.imageContainer.selectAll('*').remove();

        // Check if we have a valid MBTI type selected
        if (vis.selectedLetters.length === 4) {
            let selectedType = vis.selectedLetters.join('');
            let mbtiType = vis.data.find(d => d.mbti === selectedType);

            // Append the new image
            let detailsContainer = vis.imageContainer.append('div')
                .attr('class', 'mbti-details-container');

            detailsContainer.append('img')
                .attr('src', `img/MBTI/${mbtiType.mbti}.png`)
                .attr('alt', mbtiType.mbti)
                .style('max-width', '60%')
                .style('max-height', '60%');

            // Append the additional information
            let infoDiv = detailsContainer.append('div')
                .attr('class', 'mbti-info');

            let personalityColorClass = `personality-color-${mbtiType.class.toLowerCase()}`;

            infoDiv.append('h3').html(`
                <span class="${personalityColorClass}"><strong>${mbtiType.personality}</strong></span><br>
                <span class="personalityClass">Class: ${mbtiType.class}</span>
            `);

            infoDiv.append('p').text(mbtiType.description);

        }
    }

}