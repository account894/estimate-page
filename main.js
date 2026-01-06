let dbRows = [];
let csvRows = [];
let worker = null;

const logEl = document.getElementById("log");
const matchBtn = document.getElementById("matchBtn");
const downloadBtn = document.getElementById("downloadBtn");
const dbStatus = document.getElementById("dbStatus");
const sheetSelect = document.getElementById("sheetSelect");
let resultRows = [];

// Worker 연결
function initWorker() {
    worker = new Worker("worker.js");
    worker.onmessage = function(e) {
        const { type, percent, resultRows: res, conflictCount } = e.data;
        if(type === 'PROGRESS') {
            matchBtn.style.background = `linear-gradient(to right, #059669 ${percent}%, #4f46e5 ${percent}%)`;
            matchBtn.textContent = `⚡ 처리 중... ${percent}%`;
        } else if(type === 'COMPLETE') {
            resultRows = res;
            addLog(`매칭 완료! (충돌: ${conflictCount}건)`, 'success');
            matchBtn.disabled = false;
            matchBtn.style.background = '';
            matchBtn.textContent = '⚡ 고속 매칭 실행';
            downloadBtn.disabled = false;
            showMessage("작업 완료", `대용량 데이터 처리 완료.\n[충돌] ${conflictCount}건`);
        }
    };
}

// 로그
function addLog(msg, type='info') {
    const time = new Date().toLocaleTimeString('ko-KR', {hour12:false});
    let prefix = "●";
    if(type==='success') prefix="✓";
    if(type==='error') prefix="✗";
    logEl.textContent += `[${time}] ${prefix} ${msg}\n`;
    logEl.scrollTop = logEl.scrollHeight;
}
function clearLog() { logEl.textContent=""; addLog("로그 초기화."); }
function showMessage(title,msg){document.getElementById("modalTitle").textContent=title;document.getElementById("modalMsg").textContent=msg;document.getElementById("modal").classList.remove("hidden");document.getElementById("modal").classList.add("flex");}
function closeModal(){document.getElementById("modal").classList.add("hidden");document.getElementById("modal").classList.remove("flex");}

// DB fetch
async function fetchDB(){
    const sheetName = sheetSelect.value;
    const SPREADSHEET_ID = "1GaUzextj8jdry2iegBK7EiWDm1VASX8od3o9tP7DoZU";
    const DB_URL = `https://opensheet.elk.sh/${SPREADSHEET_ID}/${sheetName}`;
    try{
        const res = await fetch(DB_URL);
        const data = await res.json();
        dbRows = data.map(r=>({
            A: r["품명"]||"",
            B: r["규격"]||"",
            C: r["단위"]||"",
            D: String(r["재료비"]||"0").replace(/,/g,""),
            E: String(r["노무비"]||"0").replace(/,/g,""),
            totalPrice: Number(String(r["재료비"]||"0").replace(/,/g,""))+Number(String(r["노무비"]||"0").replace(/,/g,""))
        }));
        dbStatus.innerHTML = `✓ DB 준비됨 (${dbRows.length}건)`;
        addLog(`DB 로드 성공 (${sheetName})`, 'success');
        if(csvRows.length>0) matchBtn.disabled=false;
    } catch(err){
        dbStatus.textContent="DB 로드 실패";
        addLog("DB 로드 오류: "+err.message,'error');
    }
}

// 시트 선택 시 fetch
sheetSelect.addEventListener("change", fetchDB);

// 파일 업로드
document.getElementById("excelFile").addEventListener("change", e=>{
    const file = e.target.files[0];
    if(!file) return;
    addLog(`파일 읽기: ${file.name}`);
    const reader = new FileReader();
    reader.onload = (evt)=>{
        try{
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data,{type:'array'});
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            csvRows = XLSX.utils.sheet_to_json(worksheet,{header:1});
            addLog(`분석 완료: ${csvRows.length}행`, 'success');
            if(dbRows.length>0) matchBtn.disabled=false;
        } catch(err){ addLog("파싱 오류: "+err.message,'error'); }
    };
    reader.readAsArrayBuffer(file);
});

// 매칭 실행
function startWorkerMatch(){
    if(csvRows.length<2) return showMessage("오류","데이터가 부족합니다.");
    addLog("백그라운드 매칭 시작...");
    matchBtn.disabled=true;
    matchBtn.textContent="⚡ 처리 중... 0%";
    matchBtn.style.background=`linear-gradient(to right, #059669 0%, #4f46e5 0%)`;
    const contentRows = csvRows.slice(1);
    worker.postMessage({type:'START', csvRows:contentRows, dbRows:dbRows});
}

// 엑셀 저장
function downloadExcel(){
    const header=[["품명","규격","단위","재료비","노무비",
        "후보1_품명","후보1_규격","후보1_단위","후보1_재료비","후보1_노무비",
        "후보2_품명","후보2_규격","후보2_단위","후보2_재료비","후보2_노무비"]];
    try{
        const ws=XLSX.utils.aoa_to_sheet(header.concat(resultRows));
        ws['!cols'] = Array(15).fill({wch:16});
        const wb=XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "매칭결과");
        XLSX.writeFile(wb, `단가매칭_${new Date().getTime()}.xlsx`);
        addLog("저장 완료.",'success');
    }catch(err){ addLog("저장 오류: "+err.message,'error'); }
}

initWorker();
window.onload = fetchDB;
