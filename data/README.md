# Dataset Descriptions

## [MusicOSet](https://marianaossilva.github.io/DSW2019/)

Select tables (songs, artists, tracks, acoustic_features) from a music database introduced by [Mariana O. S. Silva](http://homepages.dcc.ufmg.br/~mariana.santos/), [Laís M. A. Rocha](http://homepages.dcc.ufmg.br/~laismota/), and [Mirella M. Moro](http://homepages.dcc.ufmg.br/~mirella/).

- **musicOset_song_centric_clean.{csv, json}**: One {row, record} per song. Artist IDs and names are included as lists. Genre is derived as a majority vote among the main genre of all participating artists.
- **musicOset_artist_centric_clean.{csv, json}**: One {row, record} per artist. Songs are included as lists. Acoustic features are derived as the averaged acoustic features of all songs.


## [RedditMBTI](https://www.reddit.com/r/SampleSize/comments/c0yx7q/results_mbti_personality_type_versus_music_taste/)

Results from a survey of MBTI and music preferences launched on by Reddit user [RockoRocks](https://www.reddit.com/user/RockoRocks/).

- **mbti_music_data_clean.csv**: Main dataset with one row per response.
- **mbti_music_data_clean_pivot.csv**: Same dataset pivoted so that the score for each genre has a separate row. Facilitates comparison between music preference and musicality.
