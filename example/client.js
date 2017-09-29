const $ = require("jquery"),
      Napster = require("../src/napster.js");

var API_KEY = 'API_KEY';

function refresh(callback) {
    $.ajax({
        url: '/reauthorize',
        method: 'GET',
        data: { refreshToken: Napster.member.refreshToken },
        success: function(data) {
            Napster.member.set({
                accessToken: data.access_token,
                refreshToken: data.refresh_token
            });

            if (callback) {
                callback(data);
            }
        }
    });
}

function getParameters() {
    var query = window.location.search.substring(1);
    var parameters = {};

    if (query) {
        query.split('&').forEach(function(item) {
            var param = item.split('=');
            parameters[param[0]] = param[1];
        });
    }

    return parameters;
}

$(document).ready(function() {
    var currentTrack;
    Napster.init({ consumerKey: API_KEY });

    Napster.player.on('ready', function(e) {
        var params = getParameters();
        if (params.accessToken) {
            Napster.member.set(params);
        }

        Napster.api.get(false, '/tracks/top', function(data) {
            var tracks = data.tracks;
            tracks.forEach(function(track, i) {
                var $t = $('<div class="track" data-track="' + track.id + '">' +
                            '<div class="album-art"></div>' +
                            '<div class="track-info">' +
                                '<div class="progress-bar"></div>' +
                                '<div class="name">' + track.name + '</div>' +
                                '<div class="artist">' + track.artistName + '</div>' +
                                '<div class="duration">' + Napster.util.secondsToTime(track.playbackSeconds) + '</div>' +
                                '<div class="current-time">' + Napster.util.secondsToTime(track.playbackSeconds) + '</div>' +
                            '</div>' +
                            '</div>');

                $t.click(function() {
                    var id = track.id;

                    if (Napster.player.currentTrack === id) {
                        Napster.player.playing ? Napster.player.pause() : Napster.player.play(id);
                    }
                    else {
                        $('[data-track="' + id + '"] .progress-bar').width(0);
                        $('[data-track="' + id + '"] .current-time').html($('[data-track="' + id + '"] .duration').html());

                        Napster.player.play(id);
                    }
                });

                $t.appendTo('#tracks');

                Napster.api.get(false, '/albums/' + track.albumId + '/images', function(data) {
                    var images = data.images;
                    $('[data-track="' + track.id + '"] .album-art')
                        .append($('<img>', { src: images[0].url }));
                });
            });
        });
    });

    Napster.player.on('playevent', function(e) {
        var playing = e.data.playing;
        var paused = e.data.paused;
        var currentTrack = e.data.id;

        $('[data-track]').removeClass('playing paused');
        $('[data-track="' + currentTrack + '"]').toggleClass('playing', playing).toggleClass('paused', paused);
    });

    Napster.player.on('playtimer', function(e) {
        var id = currentTrack;
        var current = e.data.currentTime;
        var total = e.data.totalTime;
        var width = $("[data-track='" + id + "'] .track-info").width();

        $("[data-track='" + id + "']").addClass("playing");
        $("[data-track='" + id + "'] .progress-bar").width(parseInt((current / total) * width).toString() + "px");
        $("[data-track='" + id + "'] .current-time").html(Napster.util.secondsToTime(total - current));
    });

    Napster.player.on('error', console.log);
});