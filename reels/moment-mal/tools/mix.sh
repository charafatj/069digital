set -e
D=$1; cd $D/out
printf "file 'p1.mp4'\nfile 'p2.mp4'\nfile 'p3.mp4'\nfile 'p4.mp4'\n" > list.txt
ffmpeg -y -v error -f concat -safe 0 -i list.txt -c copy video_only.mp4
ffmpeg -y -v error -i video_only.mp4 -i ../audio/vo.wav -i ../audio/music.wav -i ../audio/sfx.wav -filter_complex \
"[2:a]volume=0.16[m];[1:a]asplit=2[v1][v2];[m][v2]sidechaincompress=threshold=0.05:ratio=6:attack=20:release=350[md];[3:a]volume=0.35[s];[v1][md][s]amix=inputs=3:normalize=0,alimiter=limit=0.95[a]" \
-map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart MomentMal_Folge01_Flugzeugfenster.mp4
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height -of compact MomentMal_Folge01_Flugzeugfenster.mp4
