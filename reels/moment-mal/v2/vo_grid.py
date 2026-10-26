# Place each VO sentence onset on the next quarter-beat of the 105 bpm grid; write vo.wav + vo_timing.json
import subprocess, re, json, sys, math
S=sys.argv[1]; FILM=sys.argv[2]; PERIOD=60/105; Q=PERIOD/4; TEMPO=1.08; LEAD=PERIOD*0.25
raw=f"{S}/audio/vo_raw.mp3"
exec(open(f"{S}/tools/align.py").read().split("dur = float")[0].split("SENT = ")[0])  # imports only
SENT=json.load(open(f"{S}/audio/timing.json"))["sentences"]; SENT=[x["text"] for x in SENT]
dur=float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",raw]))
out=subprocess.run(["ffmpeg","-hide_banner","-i",raw,"-af","silencedetect=noise=-38dB:d=0.22","-f","null","-"],capture_output=True,text=True).stderr
st=[float(x) for x in re.findall(r"silence_start: ([\d.]+)",out)]; en=[float(x) for x in re.findall(r"silence_end: ([\d.]+)",out)]
sil=list(zip(st,en)); sil=[(0,0)]+sil if sil and sil[0][0]>0.05 else sil
segs=[]
for i,(s,e) in enumerate(sil):
    nxt=sil[i+1][0] if i+1<len(sil) else dur
    if nxt-e>0.05: segs.append((max(0,e-0.06),min(dur,nxt+0.08)))
m=[]
for s in segs:
    if m and s[0]<=m[-1][1]: m[-1]=(m[-1][0],s[1])
    else: m.append(s)
segs=m; ch=[len(s) for s in SENT]; sd=[b-a for a,b in segs]; rate=sum(sd)/sum(ch); N,M_=len(SENT),len(segs)
INF=1e18; dp=[[INF]*(M_+1) for _ in range(N+1)]; bp=[[0]*(M_+1) for _ in range(N+1)]; dp[0][0]=0
for i in range(1,N+1):
    for j in range(1,M_+1):
        for k in range(i-1,j):
            if dp[i-1][k]>=INF: continue
            c=dp[i-1][k]+(sum(sd[k:j])-rate*ch[i-1])**2
            if c<dp[i][j]: dp[i][j]=c; bp[i][j]=k
groups=[]; j=M_
for i in range(N,0,-1): k=bp[i][j]; groups.append((k,j)); j=k
groups.reverse()
GAP_IN=0.12
# output timeline in final (post-tempo) seconds; build filter in pre-tempo seconds
place=[]; t=LEAD; filt=[]; res=[]
for si,(k,j) in enumerate(groups):
    onset=math.ceil((t-1e-6)/Q)*Q          # quarter-beat grid, final time
    pos=onset*TEMPO; sp=[]
    for q in range(k,j):
        a,b=segs[q]; filt.append((a,b,pos)); sp.append((pos/TEMPO,(pos+(b-a))/TEMPO)); pos+=(b-a)+(GAP_IN if q<j-1 else 0)
    end=pos/TEMPO; t=end+0.14
    words=SENT[si].split(); wl=[len(w)+1 for w in words]; tot=sum(wl); spd=sum(b-a for a,b in sp)
    def at(fr):
        r=fr*spd
        for a,b in sp:
            if r<=b-a: return a+r
            r-=b-a
        return sp[-1][1]
    acc=0; wt=[]
    for w,l in zip(words,wl): wt.append({"w":w,"s":round(at(acc/tot),3),"e":round(at((acc+l)/tot),3)}); acc+=l
    res.append({"i":si,"text":SENT[si],"s":round(sp[0][0],3),"e":round(end,3),"beat":round(onset/PERIOD,3),"words":wt})
total=t+2.2
fc=[];lab=[]
for n,(a,b,p) in enumerate(filt):
    fc.append(f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={max(0,b-a-0.03):.3f}:d=0.03,adelay={int(p*1000)}|{int(p*1000)}[s{n}]"); lab.append(f"[s{n}]")
fc.append("".join(lab)+f"amix=inputs={len(lab)}:normalize=0,apad=whole_dur={total*TEMPO:.3f},atrim=0:{total*TEMPO:.3f},atempo={TEMPO},loudnorm=I=-16:TP=-1.5:LRA=9[out]")
open(f"{FILM}/audio/fc.txt","w").write(";".join(fc))
subprocess.run(["ffmpeg","-y","-hide_banner","-loglevel","error","-i",raw,"-filter_complex_script",f"{FILM}/audio/fc.txt","-map","[out]","-ar","48000","-ac","2",f"{FILM}/audio/vo.wav"],check=True)
json.dump({"duration":round(total,3),"period":PERIOD,"sentences":res},open(f"{FILM}/vo_timing.json","w"),ensure_ascii=False,indent=1)
for r in res: print(f'b{r["beat"]:7.2f} {r["s"]:6.2f}-{r["e"]:6.2f} {r["text"]}')
print("total",total, "beats", total/PERIOD)
