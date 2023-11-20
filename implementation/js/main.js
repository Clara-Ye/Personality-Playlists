
// load data
let promises = [
    d3.json("data/musicOset_genre_centric_clean.json"),
    d3.json("data/musicOset_artist_centric_clean.json"),
    d3.json("data/musicOset_song_centric_clean.json"),
    d3.json("data/MBTI.json")
];

Promise.all(promises)
    .then(function (data) {
        createVis(data)
    })
    .catch(function (err) {
        console.log(err)
    });

// init main page
function createVis(data) {
    // musicOset data
    let genreData = data[0],
        artistData = data[1],
        songData = data[2];

    // create genre visualization instance
    let genreVis = new GenreVis("genre_vis", genreData, artistData, songData);
  
    // MBTI data
    let mbtiData = data[3];

    // create MBTI visualization instance
    let mbtiAll = new mbtiAllVis("mbtiAll", mbtiData);
    let mbtiDetail = new mbtiDetailVis("mbtiDetail", mbtiData);

}
