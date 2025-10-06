import React, { memo } from 'react';
import './playlists.css';

function Playlists() {
  const playlists = [
    'https://open.spotify.com/playlist/3VKZujEzSQn2p7cen4HZz3?si=a7bf393b7cdd4f4d',
    'https://open.spotify.com/playlist/2ANaMbTYEsfoCIWrUaBmyt?si=592b364e8f1d446a',
    'https://open.spotify.com/playlist/23X2L6z1ycUdSqs8KzvHs5?si=b1f4eb1026ee4d6c'
  ];

  return (
    <section id="playlists" className="content-section playlists">
      <div className="playlists-grid">
        {playlists.map((playlistUrl, index) => {
          // Extract playlist ID from URL
          const playlistId = playlistUrl.match(/playlist\/([^?]+)/)?.[1];
          const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;

          return (
            <div key={index} className="playlist-item">
              <iframe
                src={embedUrl}
                width="100%"
                height="380"
                frameBorder="0"
                allowFullScreen=""
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title={`Spotify Playlist ${index + 1}`}
              ></iframe>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default memo(Playlists);
