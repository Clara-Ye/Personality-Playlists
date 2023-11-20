let promises = [
    d3.json("data/MBTI.json")
];

Promise.all(promises)
    .then(function (data) {
        createVis(data)
    })
    .catch(function (err) {
        console.log(err)
    });

function createVis(data) {
    let mbtiData = data[0]

    let mbtiAll = new mbtiAllVis("mbtiAll", mbtiData);
    let mbtiDetail = new mbtiDetailVis("mbtiDetail", mbtiData);

}
