import ast
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
pd.set_option('display.max_columns', None)
from genre_mapping import genre_mapping, uncertain_label

GENRE_LIST = [
    'classical', 'pop', 'R&B', 'country', 'EDM', 'metal', 'rock',
    'jazz', 'hip hop', 'folk', 'world', 'ambient', 'synthwave'
    ]


###################
#    read data    #
###################

songs = pd.read_csv("../raw/songs.csv", sep="\t")
artists = pd.read_csv("../raw/artists.csv", sep="\t")
tracks = pd.read_csv("../raw/tracks.csv", sep="\t")
acoustics = pd.read_csv("../raw/acoustic_features.csv", sep="\t")


###################
#   clean songs   #
###################

# drop unneeded columns
songs.drop(["billboard"], axis=1, inplace=True)

# get list of artists and list of artist names
songs['artists'] = songs['artists'].apply(ast.literal_eval)
songs['artist_ids'] = songs['artists'].apply(lambda x: list(x.keys()))
songs['artist_names'] = songs['artists'].apply(lambda x: list(x.values()))
songs.drop(["artists"], axis=1, inplace=True)


###################
#  clean artists  #
###################

# drop unneeded columns
artists.drop(["followers", "image_url"], axis=1, inplace=True)

# turn fine-grained genres into unbrella genres
artists['main_genre_detailed'] = artists['main_genre']
artists['main_genre'] = artists['main_genre_detailed'].replace(genre_mapping)

# set out-of-vocabulary genres to "Other"
artists['main_genre'] = artists['main_genre'].map(lambda x: x if x in GENRE_LIST else 'Other')


###################
#  clean tracks   #
###################

# drop unneeded columns
tracks.drop(["album_id", "track_number", "release_date_precision"], axis=1, inplace=True)

# turn release dates into years
tracks['release_year'] = tracks['release_date'].str.slice(0, 4)
tracks.drop(["release_date"], axis=1, inplace=True)


###################
# clean acoustics #
###################

# drop unneeded columns
acoustics.drop(["duration_ms", "key", "mode", "time_signature",
                "danceability", "energy", "liveness"], axis=1, inplace=True)

# center and scale acoustic features
scaler = MinMaxScaler()
acoustic_features = list(acoustics.columns.drop(['song_id']))
acoustics_scaled = pd.DataFrame(
    scaler.fit_transform(acoustics[acoustic_features]),
    columns=acoustic_features)
acoustics = pd.concat([acoustics, acoustics_scaled.add_suffix('_scaled')], axis=1)

# redefine acoustic features with scaled versions included
acoustic_features = list(acoustics.columns.drop(['song_id']))


###################
#   combine DFs   #
###################

# initialize dataframes
full_song_centric, full_artist_centric = pd.DataFrame(), pd.DataFrame()
full_song_centric = full_song_centric._append(songs)
full_artist_centric = full_artist_centric._append(artists)

#
# song-centric
#

# get list of genres and primary genre
def get_genres(artist_ids):
    genre_counts = artists[artists['artist_id'].isin(artist_ids)]['main_genre'].value_counts()
    if uncertain_label in genre_counts.index and len(genre_counts) > 1:
        genre_counts = genre_counts[genre_counts.index != uncertain_label]
    genres_dict = genre_counts.to_dict()
    primary_genre = max(genres_dict, key=genres_dict.get) if genres_dict else None
    return {'genres': genres_dict, 'primary_genre': primary_genre}

full_song_centric[['genres', 'primary_genre']] = full_song_centric['artist_ids'].apply(get_genres).apply(pd.Series)

# append release years
full_song_centric = pd.merge(full_song_centric, tracks,
                             left_on='song_id', right_on='song_id', how='left')

# append acoustic features
full_song_centric = pd.merge(full_song_centric, acoustics,
                             left_on='song_id', right_on='song_id', how='left')

print(full_song_centric.head())
print(full_song_centric.columns)

#
# artist-centric
#

# get list of songs
temp = songs.explode('artist_ids')
temp = pd.merge(temp, artists, left_on='artist_ids', right_on='artist_id', how='left')
song_ids = temp.groupby('artist_id')['song_id'].agg(list).reset_index()
full_artist_centric = pd.merge(full_artist_centric, song_ids, on='artist_id', how='left')
full_artist_centric = full_artist_centric.rename(columns={'song_id': 'song_ids'})

# get average acoustic features of the songs
# TODO: do we need max/min/any other aggregate stats?
temp = pd.merge(temp, acoustics, on='song_id', how='left')
acoustic_features_avg = temp.groupby('artist_id')[acoustic_features].mean().reset_index()
full_artist_centric = pd.merge(full_artist_centric, acoustic_features_avg,
                               on='artist_id', how='left')

print(full_artist_centric.head())
print(full_artist_centric.columns)

#
# genre-centric
#

# initialize dataframe
full_genre_centric = pd.DataFrame({'genre': GENRE_LIST})

# get list of artists
artist_ids_by_genre = full_artist_centric.groupby('main_genre')['artist_id'].agg(list).reset_index()
full_genre_centric = pd.merge(full_genre_centric, artist_ids_by_genre,
                              left_on='genre', right_on='main_genre', how='left')
full_genre_centric = full_genre_centric.rename(columns={'artist_id': 'artist_ids'})

# get acoustic features by genre
acoustic_features_by_genre = full_artist_centric.groupby('main_genre')[acoustic_features].mean().reset_index()
full_genre_centric = pd.merge(full_genre_centric, acoustic_features_by_genre,
                              left_on='genre', right_on='main_genre', how='left')

# drop repetitive columns
full_genre_centric.drop(["main_genre_x", "main_genre_y"], axis=1, inplace=True)

print(full_genre_centric.head())
print(full_genre_centric.columns)


###################
#  output files   #
###################

# csv
full_song_centric.to_csv('../musicOset_song_centric_clean.csv', index=False)
full_artist_centric.to_csv('../musicOset_artist_centric_clean.csv', index=False)
full_genre_centric.to_csv('../musicOset_genre_centric_clean.csv', index=False)

# json
full_song_centric.to_json('../musicOset_song_centric_clean.json', orient='records')
full_artist_centric.to_json('../musicOset_artist_centric_clean.json', orient='records')
full_genre_centric.to_json('../musicOset_genre_centric_clean.json', orient='records')
