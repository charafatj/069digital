import subprocess, re, json, sys
D = sys.argv[1]
raw = f"{D}/audio/vo_raw.mp3"
SENT = [
 "Fenster im Flugzeug sind nie eckig.","Niemals.","Und dafür gibt es einen ziemlich düsteren Grund.",
 "1954.","Die de Havilland Comet ist das erste Passagierflugzeug mit Düsenantrieb.","Der Stolz der Luftfahrt.",
 "Und dann brechen innerhalb von drei Monaten zwei Comets in der Luft auseinander.",
 "Die Ermittler finden die Ursache.","Bei jedem Flug wird die Kabine aufgepumpt wie ein Luftballon.",
 "Nach der Landung wieder entleert.","Immer und immer wieder.",
 "An den Ecken eines Fensters kann sich die Spannung nicht verteilen.","Sie staut sich genau dort.",
 "Ein winziger Riss.","Mit jedem Flug ein bisschen länger.","Bis das Metall nachgibt.",
 "Ein rundes Fenster hat keine Ecken.","Die Kraft fließt einfach drumherum.",
 "Achtung, jetzt kommt's:","Schau beim nächsten Flug mal unten ins Fenster.","Da ist ein winziges Loch.",
 "Das ist kein Fehler.","Es sorgt dafür, dass die äußere Scheibe den Druck trägt.","Und die innere nicht beschlägt.",
 "Runde Fenster sind also kein Design.","Sie sind der Grund, warum du heil ankommst.",
 "Moment mal.","Folg mir für mehr."]
dur = float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",raw]))
out = subprocess.run(["ffmpeg","-hide_banner","-i",raw,"-af","silencedetect=noise=-38dB:d=0.22","-f","null","-"],capture_output=True,text=True).stderr
st=[float(x) for x in re.findall(r"silence_start: ([\d.]+)",out)]
en=[float(x) for x in re.findall(r"silence_end: ([\d.]+)",out)]
# speech segments between silences
sil=list(zip(st,en))
if sil and sil[0][0]>0.05: sil=[(0,0)]+sil
segs=[]
for i,(s,e) in enumerate(sil):
    nxt = sil[i+1][0] if i+1<len(sil) else dur
    if nxt-e>0.05: segs.append((max(0,e-0.06),min(dur,nxt+0.08)))
# merge overlapping
m=[]
for s in segs:
    if m and s[0]<=m[-1][1]: m[-1]=(m[-1][0],s[1])
    else: m.append(s)
segs=m
print(len(segs),"segments",len(SENT),"sentences",file=sys.stderr)
# DP align sentences to segment groups
ch=[len(s) for s in SENT]; sd=[b-a for a,b in segs]
rate=sum(sd)/sum(ch)
N,M=len(SENT),len(segs)
INF=1e18
dp=[[INF]*(M+1) for _ in range(N+1)]; bp=[[0]*(M+1) for _ in range(N+1)]
dp[0][0]=0
for i in range(1,N+1):
    for j in range(1,M+1):
        for k in range(i-1,j):
            if dp[i-1][k]>=INF: continue
            c=dp[i-1][k]+(sum(sd[k:j])-rate*ch[i-1])**2
            if c<dp[i][j]: dp[i][j]=c; bp[i][j]=k
if dp[N][M]>=INF: sys.exit("align fail")
groups=[];j=M
for i in range(N,0,-1):
    k=bp[i][j]; groups.append((k,j)); j=k
groups.reverse()
# build tightened audio: segments with fixed gaps; bigger gap between sentences
GAP_IN=0.12; GAP_S=0.22; TEMPO=1.08
parts=[];t=0.15;seg_new=[]
filt=[]
for si,(k,j) in enumerate(groups):
    for q in range(k,j):
        a,b=segs[q]
        seg_new.append((si,t,t+(b-a)))
        filt.append((a,b,t))
        t+=(b-a)+(GAP_IN if q<j-1 else GAP_S)
total=t+0.3
# ffmpeg filter: atrim each, adelay, amix
fc=[];labels=[]
for n,(a,b,pos) in enumerate(filt):
    fc.append(f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={max(0,b-a-0.03):.3f}:d=0.03,adelay={int(pos*1000)}|{int(pos*1000)}[s{n}]")
    labels.append(f"[s{n}]")
fc.append("".join(labels)+f"amix=inputs={len(labels)}:normalize=0,apad=whole_dur={total:.3f},atrim=0:{total:.3f},atempo={TEMPO},loudnorm=I=-15:TP=-1.5:LRA=9[out]")
open(f"{D}/audio/fc.txt","w").write(";".join(fc))
subprocess.run(["ffmpeg","-y","-hide_banner","-loglevel","error","-i",raw,"-filter_complex_script",f"{D}/audio/fc.txt","-map","[out]","-ar","48000","-ac","2",f"{D}/audio/vo.wav"],check=True)
# sentence timings after tempo; word timings proportional to chars within sentence speech
res=[]
for si,s in enumerate(SENT):
    sp=[(a/TEMPO,b/TEMPO) for (x,a,b) in seg_new if x==si]
    words=s.split()
    wl=[len(w)+1 for w in words]; tot=sum(wl)
    spd=sum(b-a for a,b in sp)
    def at(frac):
        r=frac*spd
        for a,b in sp:
            if r<=b-a: return a+r
            r-=b-a
        return sp[-1][1]
    acc=0;wt=[]
    for w,l in zip(words,wl):
        wt.append({"w":w,"s":round(at(acc/tot),3),"e":round(at((acc+l)/tot),3)}); acc+=l
    res.append({"i":si,"text":s,"s":round(sp[0][0],3),"e":round(sp[-1][1],3),"words":wt})
json.dump({"duration":round(total/TEMPO,3),"sentences":res},open(f"{D}/audio/timing.json","w"),ensure_ascii=False,indent=1)
for r in res: print(f'{r["s"]:6.2f}-{r["e"]:6.2f} {r["text"]}')
print("total",total/TEMPO)
