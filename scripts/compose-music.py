"""Render the six original instrumental loops with numpy and ffmpeg."""
from pathlib import Path
import subprocess

import numpy as np

RATE = 32000
DEST = Path(__file__).resolve().parents[1] / 'public' / 'music'
MAJOR = (0, 2, 4, 5, 7, 9, 11)
DORIAN = (0, 2, 3, 5, 7, 9, 10)
# Tonic, tempo, metre, scale, lead voice, chord roots and melodic motifs.
SCORES = {
    'park': (60, 92, 4, MAJOR, 'flute', (0, 3, 1, 4, 0, 5, 3, 4),
             ((2, 4, 6, 4, 2), (1, 2, 4, 2), (4, 6, 7, 6, 4), (2, 1, 0))),
    'playground': (62, 118, 4, MAJOR, 'mallet', (0, 4, 5, 3, 1, 4, 3, 0),
                   ((0, 2, 4, 7, 4, 2), (4, 3, 2, 1), (2, 4, 5, 7, 6), (4, 2, 0))),
    'party': (65, 126, 3, MAJOR, 'reed', (0, 3, 4, 0, 5, 1, 4, 0),
              ((4, 4, 6, 7), (2, 4, 2), (3, 5, 7, 5), (4, 2, 0))),
    'space': (59, 72, 4, DORIAN, 'glass', (0, 2, 5, 3, 0, 6, 3, 4),
              ((7, 4, 2), (6, 4, 1), (2, 6, 8, 7), (4, 0))),
    'ocean': (62, 82, 3, DORIAN, 'harp', (0, 3, 6, 4, 0, 5, 3, 0),
              ((0, 2, 4, 5), (4, 2, 1), (2, 4, 6, 4), (3, 1, 0))),
    'ice': (67, 78, 3, MAJOR, 'celesta', (0, 5, 3, 4, 2, 5, 4, 0),
            ((4, 7, 6), (2, 4, 2, 1), (5, 7, 9, 7), (4, 2, 0))),
}

def render(name, score):
    tonic, bpm, metre, scale, voice, roots, motifs = score
    beat = 60 / bpm
    mix = np.zeros((round(beat * metre * len(roots) * RATE), 2))

    def note(start, beats, degree, octave, timbre, gain, pan):
        pitch = tonic + scale[degree % 7] + 12 * (degree // 7 + octave)
        t = np.arange(round(beats * beat * RATE)) / RATE
        phase = 2 * np.pi * 440 * 2 ** ((pitch - 69) / 12) * t
        partial, brightness, decay = {
            'flute': (2, .17, 1.3), 'reed': (3, .23, 2.4),
            'mallet': (4, .27, 6), 'glass': (2.01, .38, 1.8),
            'harp': (3, .35, 4.4), 'celesta': (3.98, .3, 4),
            'bass': (2, .2, 3), 'pluck': (2, .28, 5),
        }[timbre]
        attack = .075 if timbre in ('flute', 'glass') else .012
        env = np.minimum(1, t / attack) * np.exp(-decay*t) * np.minimum(1, (t[-1]-t)/.085)
        wave = gain * env * (np.sin(phase) + brightness * np.exp(-2*t) * np.sin(partial*phase))
        pos = (round(start*beat*RATE) + np.arange(len(t))) % len(mix)
        mix[pos] += wave[:, None] * np.array([1-pan, pan])

    for bar, root in enumerate(roots):
        downbeat = bar * metre
        note(downbeat, metre*.8, root, -1, 'bass', .22, .48)
        for i in range(metre):
            note(downbeat+i+.5, .9, root+(0,2,4,2)[i], 0, 'pluck', .12, .32)
        motif = motifs[bar % 4]
        for i, degree in enumerate(motif):
            spacing = metre / len(motif)
            lift = 2 if bar in (4,5) else 0
            note(downbeat+i*spacing, spacing*1.15, degree+lift, 1, voice, .22, .57)
    # A short stereo echo wraps around the loop point along with the final notes.
    mix += .13 * np.roll(mix[:, ::-1], round(beat*.75*RATE), axis=0)
    pcm = (mix * (12500 / np.abs(mix).max())).astype('<i2')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 's16le', '-ar', str(RATE),
                    '-ac', '2', '-i', '-', '-codec:a', 'libmp3lame', '-b:a', '80k',
                    str(DEST / (name+'.mp3'))], input=pcm.tobytes(), check=True)

if __name__ == '__main__':
    DEST.mkdir(exist_ok=True)
    for name, score in SCORES.items():
        render(name, score)
