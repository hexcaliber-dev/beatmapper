import sys
from playsound import playsound
from pynput import keyboard
import os.path
import multiprocessing
from time import sleep

started = False
currbeat = 0

def on_press(key):
    global started, currbeat, file
    if started:
        try:
            if key.char in [str(i) for i in range(10)]:
                to_write = 'b' + str(currbeat) + ' ' + key.char
                print(' |', to_write)
                file.write(to_write + '\n')

            elif key.char == 'q':
                print('Script terminated.')
                mp.terminate()
                file.close()
                started = False
                beats.terminate()
                
        except Exception as e:
            # print(e)
            pass

def beat_counter(bpm):
    global started, currbeat
    listener = keyboard.Listener(on_press=on_press)
    listener.start()
    bpm = int(bpm)
    while started:
        # print('BEAT', currbeat)
        sleep(60 / bpm)
        currbeat += 1

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('Usage: python3 beatmapper.py <MUSIC FILE>')
    else:
        filename = sys.argv[1]
        if os.path.isfile(filename):
            print('Creating mapping for:', filename)
            bpm = input('Enter BPM: ')
            mp = multiprocessing.Process(target=playsound, args=[filename])
            beats = multiprocessing.Process(target=beat_counter, args=[bpm])
            input('Press any key to begin')
            file = open(filename.split('/')[-1].split('.')[0] + ".txt", "w")
            file.write('bpm ' + bpm + '\n')
            started = True
            mp.start()
            beats.start()
            print('Input capture started. Press q to finish')

        else:
            print('File not found:', filename)

    
