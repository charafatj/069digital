import numpy as np, json, subprocess, sys
D=sys.argv[1]; SR=48000
T=json.load(open(D+'/audio/timing.json')); S=T['sentences']; st=lambda i:S[i]['s']; DUR=T['duration']+0.2
N=int(DUR*SR); t=np.arange(N)/SR; rng=np.random.default_rng(3)
def env(n,a,d): x=np.arange(n)/SR; return np.minimum(1,x/max(a,1e-4))*np.exp(-x/d)
mus=np.zeros(N)
# 100 bpm groove: chords Am - F - C - G (fmaj7 colour), soft pads + plucks + light kick/hat
bpm=100; beat=60/bpm; bar=beat*4
prog=[[57,60,64,67],[53,57,60,64],[48,52,55,59],[55,59,62,65]]
f=lambda m:440*2**((m-69)/12)
nb=int(DUR/bar)+1
for b in range(nb):
    ch=prog[b%4]; s0=int(b*bar*SR); n=int(bar*SR)
    if s0>=N: break
    n=min(n,N-s0); x=np.arange(n)/SR
    pad=sum(np.sin(2*np.pi*f(m)*x)+.3*np.sin(2*np.pi*f(m)*2.003*x) for m in ch)/len(ch)
    pad*=np.minimum(1,x/.3)*np.minimum(1,(n/SR-x)/.3)
    mus[s0:s0+n]+=.10*pad
    bass=np.sin(2*np.pi*f(ch[0]-24)*x)*np.exp(-((x%beat))/0.35)
    mus[s0:s0+n]+=.16*bass
    for k in range(8):  # eighth-note pluck arpeggio
        p0=s0+int(k*beat/2*SR); m=ch[[0,2,1,3,2,1,3,2][k]]+12
        nn=min(int(.35*SR),N-p0)
        if nn<=0: continue
        xx=np.arange(nn)/SR; pl=(np.sin(2*np.pi*f(m)*xx)+.4*np.sin(4*np.pi*f(m)*xx))*np.exp(-xx/.09)
        mus[p0:p0+nn]+=.06*pl
    for k in range(4):
        p0=s0+int(k*beat*SR); nn=min(int(.25*SR),N-p0)
        if nn<=0: continue
        xx=np.arange(nn)/SR
        kick=np.sin(2*np.pi*(50+90*np.exp(-xx/.03))*xx)*np.exp(-xx/.12); mus[p0:p0+nn]+=.22*kick
        h0=p0+int(beat/2*SR); hn=min(int(.05*SR),N-h0)
        if hn>0: mus[h0:h0+hn]+=.03*rng.standard_normal(hn)*np.exp(-np.arange(hn)/SR/.012)
# fade music out at end, dip at drama (crash), softer in outro
g=np.ones(N); g*=np.minimum(1,t/0.5); g*=np.clip((DUR-t)/1.2,0,1)
mus*=g
sfx=np.zeros(N)
def add(at,sig,vol):
    p=int(at*SR); n=min(len(sig),N-p)
    if n>0 and p>=0: sfx[p:p+n]+=vol*sig[:n]
def whoosh(d=.45):
    n=int(d*SR); x=np.arange(n)/SR; w=rng.standard_normal(n)
    # crude band sweep via cumulative smoothing with varying alpha
    out=np.zeros(n); y=0
    for i in range(n):
        a=.02+.25*(i/n); y+=a*(w[i]-y); out[i]=y
    return out*np.sin(np.pi*x/d)**2*3
def pop():
    n=int(.12*SR); x=np.arange(n)/SR; return np.sin(2*np.pi*(900-500*x/.12)*x)*np.exp(-x/.03)
def ding():
    n=int(1.0*SR); x=np.arange(n)/SR; return (np.sin(2*np.pi*1318*x)+.5*np.sin(2*np.pi*1975*x))*np.exp(-x/.35)
def crack(d=.25):
    n=int(d*SR); x=np.arange(n)/SR; w=rng.standard_normal(n)*(rng.random(n)<.08); return w*np.exp(-x/(d/3))*2
def boom():
    n=int(1.4*SR); x=np.arange(n)/SR; return (np.sin(2*np.pi*(40+60*np.exp(-x/.1))*x)+.4*rng.standard_normal(n)*np.exp(-x/.15))*np.exp(-x/.45)
def tick():
    n=int(.02*SR); x=np.arange(n)/SR; return np.sin(2*np.pi*2400*x)*np.exp(-x/.004)
cuts=[st(2),st(3),st(8),st(11),st(18),st(24),st(25),st(26)]
for c in cuts: add(c-.3,whoosh(),.25)
for i,dl in [(4,.2),(6,.5),(7,.6),(8,.0),(11,.6),(13,.0),(16,.1),(20,.5),(22,1.1),(23,.3),(24,.4),(25,.1)]: add(st(i)+dl,pop(),.35)
add(st(1)+.15,crack(.15),.5); add(st(1)+.3,pop(),.4)
add(st(3),boom(),.35)
add(st(6)+2.6,boom(),.6); add(st(6)+2.6,crack(.6),.6)
add(st(13)+.1,crack(.3),.7)
add(st(15)+.2,crack(.8),.9); add(st(15)+.2,boom(),.4)
add(st(16),ding(),.35)
add(st(21),pop(),.5)
add(st(27)+.4,pop(),.5); add(st(27)+.55,ding(),.3)
# flight counter ticks
a,b=st(14),st(16)-.2
for k in np.arange(a,b,.07): add(k,tick(),.15)
# pressure cycle ticks
for k in np.arange(st(10),st(11)-.1,.12): add(k,tick(),.12)
mix=np.stack([mus,sfx],0)
np.save(D+'/audio/tmp.npy',mix)
for name,sig in [('music',mus),('sfx',sfx)]:
    sig=sig/ (np.max(np.abs(sig))+1e-9)*.9
    pcm=(np.repeat(sig[:,None],2,1)*32767).astype(np.int16).tobytes()
    subprocess.run(['ffmpeg','-y','-v','error','-f','s16le','-ar',str(SR),'-ac','2','-i','-',D+f'/audio/{name}.wav'],input=pcm,check=True)
print('ok',DUR)
