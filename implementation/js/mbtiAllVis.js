class mbtiAllVis {

	constructor(_parentElement, _data,) {
		this.parentElement = _parentElement;
		this.data = _data;

		this.initVis();
	}

	initVis() {
		let vis = this;

		vis.margin = { top: 40, right: 40, bottom: 40, left: 40 };

		vis.imageWidth = 80;
		vis.imageHeight = 80;

		vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
		vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

		d3.select('#' + vis.parentElement)
			.style('background-image', 'url("img/background.jpg")')
			.style('background-size', `${vis.width+vis.margin.left+vis.margin.right}px ${vis.height+vis.margin.top*2+vis.margin.bottom}px`)
			.style('background-repeat', 'no-repeat');

		// Create a div for the images
		vis.imgContainer = d3.select('#' + vis.parentElement).append('div')
			.attr('class', 'img-container')
			.style('position', 'relative')
			.style('width', vis.width)
			.style('height', vis.height);

		vis.tooltipImages = [];
		for (let i = 1; i <= 7; i++) {
			vis.tooltipImages.push(`img/tooltip/tooltip_${i}.png`);
		}

		window.addEventListener('resize', () => vis.handleResize());

		vis.wrangleData();
		vis.handleResize();
	}

	handleResize() {
		let vis = this;

		// Update width and height based on the new window size
		vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
		vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

		vis.imgContainer.style('width', vis.width).style('height', vis.height);


		vis.updateVis();
	}

	wrangleData() {
		let vis = this;

		vis.displayData = this.data;

		// Update the visualization
		vis.updateVis();
	}

	updateVis() {
		let vis = this;
		vis.imgContainer.selectAll('*').remove();
		// Helper function to check overlap
		function isOverlapping(newImgPos, addedImages) {
			return addedImages.some(imgPos => {
				return !(newImgPos.left + vis.imageWidth < imgPos.left ||
					newImgPos.left > imgPos.left + vis.imageWidth ||
					newImgPos.top + vis.imageHeight < imgPos.top ||
					newImgPos.top > imgPos.top + vis.imageHeight);
			});
		}

		let addedImages = [];

		vis.displayData.forEach((d, index) => {
			let img = document.createElement('img');
			img.src = `img/MBTI/${d.mbti}.png`;
			img.alt = d.mbti;
			img.style.position = 'absolute';
			img.style.cursor = 'pointer';
			img.classList.add('mbti-img');

			// Attempt to find a non-overlapping random position
			let overlap, newPos;
			let bottomDis = 2/3;
			do {
				newPos = {
					left: Math.random() * (vis.width - vis.imageWidth),
					top: (vis.height*bottomDis) + Math.random() * (vis.height*(1-bottomDis) - vis.imageHeight)
				};
				overlap = isOverlapping(newPos, addedImages);
			} while (overlap);

			// Set the non-overlapping position
			img.style.left = `${newPos.left}px`;
			img.style.top = `${newPos.top}px`;

			// Add the position to the array for future overlap checks
			addedImages.push(newPos);

			// Append image
			vis.imgContainer.node().appendChild(img);

			// Tooltip setup
			let tooltip = document.createElement('div');
			tooltip.classList.add('mbti-tooltip');
			tooltip.innerHTML = `<strong>${d.mbti}</strong>: <br>${d.personality}`;

			// Randomly select a background image from the list
			let randomTooltip = vis.tooltipImages[Math.floor(Math.random() * vis.tooltipImages.length)];
			tooltip.style.backgroundImage = `url("${randomTooltip}")`;

			vis.imgContainer.node().appendChild(tooltip);

			// Event listeners for tooltip
			img.onmouseover = () => {
				tooltip.style.display = 'block';
				let tooltipWidth = 120;
				let tooltipHeight = 90;

				// Calculate positions
				let leftPosition = img.offsetLeft + (vis.imageWidth - tooltipWidth) / 2;
				let topPosition = img.offsetTop - tooltipHeight;

				if (topPosition < 0) {
					topPosition = img.offsetTop + vis.imageHeight;
				}

				tooltip.style.left = `${leftPosition}px`;
				tooltip.style.top = `${topPosition}px`;
			};

			img.onmouseout = () => {
				tooltip.style.display = 'none';
			};
		});
	}

}