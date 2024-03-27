window.addEventListener('load', () => {
  const bpm = 1605 / 1570;
  let playing = false;

  const url = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`;
  const prefix = `${url}/audio/`;
  const tracks = {
    taylor: {
      drums: `https://32teeth.github.io/Holy-Smoking-Ground/audio/original/HolyGroundDrums.m4a`,
      music: `https://32teeth.github.io/Holy-Smoking-Ground/audio/original/HolyGroundMusic.m4a`,
      vocals: `https://32teeth.github.io/Holy-Smoking-Ground/audio/original/HolyGroundVocals.m4a`,
    },
    maiden: {
      drums: `https://32teeth.github.io/Holy-Smoking-Ground/audio/original/HolySmokeDrums.m4a`,
      music: `https://32teeth.github.io/Holy-Smoking-Ground/audio/original/HolySmokeMusic.m4a`,
      vocals: `https://32teeth.github.io/Holy-Smoking-Ground/audio/original/HolySmokeVocals.m4a`,
    },
  };

  const volumes = {
    taylor: 0.75,
    maiden: 1,
  };

  const audio = {};

  let initialized = false;
  const init = () => {
    for (const track in tracks) {
      audio[track] = {};
      for (const part in tracks[track]) {
        const element = document.querySelector(`audio[src="${tracks[track][part]}"]`);
        const src = document.createElement('src');
        src.src = `${tracks[track][part]}`;
        src.type = 'audio/mp4';
        element.appendChild(src);

        const context = new (window.AudioContext || window.webkitAudioContext)();
        const source = context.createMediaElementSource(element);
        const volume = context.createGain();
        source.connect(volume);
        //element.playbackRate = bpm;
        if(track === 'maiden') element.playbackRate = bpm;
        element.preservesPitch = true;
        volume.connect(context.destination);
        audio[track][part] = {context, source, volume};
        audio[track][part].volume.gain.value = track === 'maiden' ? 0 : volumes[track];
      }
    };
    initialized = true;
  };

  const checked = {
    drums: 'taylor',
    music: 'taylor',
    vocals: 'taylor',
  };

  const volume = (part) => {
    let track = checked[part];
    const swap = track === 'taylor' ? 'maiden' : 'taylor';


    const waxing = audio[track][part]
    const waning = audio[swap][part];

    const fade = setInterval(() => {
      elapsed++;
      waxing.volume.gain.value = 0 + (volumes[track] / steps) * elapsed;
      waning.volume.gain.value = volumes[swap] - (volumes[swap] / steps) * elapsed;
      if (elapsed === steps) {
          clearInterval(fade);
      }
  });

    let elapsed = 0;
    const steps = 25;
  };

  const reset = () => {
    for (const track in audio) {
      for (const part in audio[track]) {
        const element = document.querySelector(`audio[src="${tracks[track][part]}"]`);
        element.currentTime = 0;
      }
    }
    document.querySelector('button#play').innerHTML = playing ? 'pause_circle' : 'play_circle';
    document.querySelector('button#play').setAttribute('state', playing);
  };
  const state = () => {
    playing = !playing;
    if(!initialized) init();
    for (const track in audio) {
      for (const part in audio[track]) {
        const element = document.querySelector(`audio[src="${tracks[track][part]}"]`);
        playing ? element.play() : element.pause();
      }
    }
    document.querySelector('button#play').innerHTML = playing ? 'pause_circle' : 'play_circle';
    document.querySelector('button#play').setAttribute('state', playing);
  };

  document.querySelectorAll('tracks input[type="checkbox"]').forEach((part) => {
    part.addEventListener('change', (event) => {
      checked[event.target.id] = event.target.checked ? 'maiden' : 'taylor';
      volume(event.target.id);
    });
  });

  document.querySelector('button#play').addEventListener('click', state);
  document.querySelector('button#reset').addEventListener('click', reset);

  setTimeout(() => {
    document.querySelector('loader').remove();
  }, 100);
});