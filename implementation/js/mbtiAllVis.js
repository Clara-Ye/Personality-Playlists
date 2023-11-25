class mbtiAllVis {

	constructor(_parentElement, _data,) {
		this.parentElement = _parentElement;
		this.data = _data;

		this.initVis();
	}

	initVis() {
		let vis = this;

		vis.margin = { top: 40, right: 40, bottom: 40, left: 40 };

		vis.imageWidth = 50;
		vis.imageHeight = 50;

		vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right - vis.imageWidth;
		vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom - vis.imageHeight;

		// Create a div for the images
		vis.imgContainer = d3.select('#' + vis.parentElement).append('div')
			.attr('class', 'img-container')
			.style('position', 'relative')
			.style('width', vis.width)
			.style('height', vis.height);

		vis.wrangleData();
	}

	wrangleData() {
		let vis = this;

		vis.displayData = this.data;

		// Update the visualization
		vis.updateVis();
	}

	updateVis() {
		let vis = this;

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
			do {
				newPos = {
					left: Math.random() * (vis.width - vis.imageWidth),
					top: Math.random() * (vis.height - vis.imageHeight)
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
			tooltip.innerHTML = `<strong>${d.mbti}</strong>: ${d.personality}`;
			vis.imgContainer.node().appendChild(tooltip);
			tooltip.style.display = 'none';

			// Event listeners for tooltip
			img.onmouseover = () => {
				tooltip.style.display = 'block';
				tooltip.style.left = `${img.offsetLeft + vis.imageWidth*1.5}px`;
				tooltip.style.top = `${img.offsetTop}px`;
			};

			img.onmouseout = () => {
				tooltip.style.display = 'none';
			};
		});
	}

}