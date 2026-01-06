// AI 지식 정의
const SYNONYM_MAP = {
    "PIPE":"파이프","관":"파이프","SPP":"강관","CARBON STEEL":"강관","흑관":"강관","백관":"강관",
    "SUS":"STS","STAINLESS":"STS","스텐":"STS","스테인리스":"STS",
    "PVC":"PVC","VG1":"PVC","VG2":"PVC","COPPER":"동관","동파이프":"동관",
    "PB":"PB","에이콘":"PB","폴리부틸렌":"PB","CPVC":"CPVC","소방용합성수지":"CPVC",
    "PE":"PE","P.E":"PE","HDPE":"PE","SR":"SR","S.R":"SR",
    "FITTING":"이음쇠","부속":"이음쇠","ELBOW":"엘보","L":"엘보","ELL":"엘보",
    "TEE":"티","T":"티","REDUCER":"레듀샤","RED":"레듀샤","R":"레듀샤","이경소켓":"레듀샤",
    "SOCKET":"소켓","SOC":"소켓","S":"소켓","COUPLING":"소켓",
    "CAP":"캡","마개":"캡","FLANGE":"플랜지","FLG":"플랜지","F":"플랜지",
    "UNION":"유니온","UN":"유니온","U":"유니온","NIPPLE":"니플","N":"니플",
    "BUSHING":"부싱","BUSH":"부싱","ADAPTER":"아답타","M.A":"아답타","F.A":"아답타","ADPT":"아답타",
    "CROSS":"크로스","X":"크로스","SADDLE":"새들","PLUG":"플러그","메꾸라":"플러그",
    "VALVE":"밸브","V/V":"밸브","V.V":"밸브","GATE":"게이트","제수변":"게이트",
    "GLOBE":"글로브","스톱밸브":"글로브","CHECK":"체크","판체크":"체크","스윙체크":"체크",
    "HAMMERLESS":"체크","BALL":"볼","볼밸브":"볼","BUTTERFLY":"버터플라이","B.F":"버터플라이",
    "BFV":"버터플라이","STRAINER":"스트레이너","STR":"스트레이너","Y-STR":"스트레이너",
    "PRV":"감압변","REDUCING":"감압변","SOL":"솔레노이드","SOLENOID":"솔레노이드",
    "AIR VENT":"에어벤트","A.V":"에어벤트","통기":"에어벤트","SAFETY":"안전변","RELIEF":"릴리프",
    "FLOAT":"정수위","F.V":"정수위","HEAD":"헤드","SPRINKLER":"헤드","S.P":"헤드",
    "ALARM":"알람","유수검지":"알람","HYDRANT":"소화전","O.H":"소화전",
    "SIAMESE":"송수구","BOX":"박스","합":"박스","함":"박스","F.BOX":"소화전함",
    "INSULATION":"보온","LAGGING":"보온","RUBBER":"고무발포","아마플렉스":"고무발포",
    "GLASS WOOL":"그라스울","유리솜":"그라스울","HANGER":"행가","CLEVIS":"행가","RING":"행가",
    "SUPPORT":"서포트","지지대":"서포트","ANGLE":"앵글","CHANNEL":"잔넬",
    "BOLT":"볼트","B":"볼트","NUT":"너트","N":"너트","GASKET":"가스켓","PACKING":"가스켓","P.K":"가스켓"
};

const INCOMPATIBLE_GROUPS = [
    ["STS","스텐","SUS"],["강관","SPP","백관","흑관"],["PVC","VG1","VG2"],
    ["동관","COPPER"],["PB","에이콘"],["CPVC"],
    ["파이프","관"],
    ["밸브","V/V","게이트","글로브","체크","볼","버터플라이","스트레이너"],
    ["엘보","티","레듀샤","소켓","캡","유니온","부싱","니플","플랜지"],
    ["보온","고무발포","그라스울","매직테이프"],["행가","서포트","절연","슈"],["철거"]
];

const synKeys = Object.keys(SYNONYM_MAP).sort((a,b)=>b.length-a.length);
const synRegex = new RegExp(synKeys.join("|"),"gi");

function norm(v){ if(!v)return""; let str=v.toString().toUpperCase(); str=str.replace(synRegex,(m)=>SYNONYM_MAP[m.toUpperCase()]||m); return str.replace(/[^A-Z0-9가-힣]/g,"").replace(/EA|EACH|개/g,"EA"); }
function isCategoryMismatch(src,tgt){ for(let i=0;i<INCOMPATIBLE_GROUPS.length;i++){ const group=INCOMPATIBLE_GROUPS[i]; let srcHas=false,tgtHas=false; for(let k=0;k<group.length;k++){ if(src.includes(group[k])) srcHas=true; if(tgt.includes(group[k])) tgtHas=true; if(srcHas && tgtHas) break;} if(srcHas!==tgtHas) return true;} return false; }

