import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";

const FONT_HEAD = "'Space Grotesk', 'Segoe UI', sans-serif";
const FONT_MONO = "'IBM Plex Mono', 'Courier New', monospace";

const COLORS = {
  bg: "#0E263F",
  panel: "#153352",
  panelLine: "#2C5680",
  grid: "#1B3E60",
  paper: "#F7F5EF",
  ink: "#1F2A33",
  cream: "#EDEBE2",
  creamSoft: "#9FB3C8",
  orange: "#E8792F",
  green: "#4E9E76",
  red: "#E2604F",
};

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];
const CLIMAS = ["Sol", "Nublado", "Chuva", "Chuva forte"];

function pad(n) {
  return String(n).padStart(2, "0");
}
function dateKey(y, m, d) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}
function todayKey() {
  const t = new Date();
  return dateKey(t.getFullYear(), t.getMonth(), t.getDate());
}
function dataLegivelDe(dateStr) {
  const [y, m, d] = dateStr.split("-").map((s) => parseInt(s, 10));
  return `${d} de ${MESES[m - 1]} de ${y}`;
}

function resizeImage(file, maxW = 900, quality = 0.62) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------------- LOGIN ----------------

function LoginScreen({ onLogged }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });
    setCarregando(false);
    if (error) {
      setErro("E-mail ou senha incorretos.");
      return;
    }
    onLogged(data.user);
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, boxSizing: "border-box", fontFamily: FONT_HEAD }}>
      <form onSubmit={entrar} style={{ width: "100%", maxWidth: 360, background: COLORS.panel, border: `1px solid ${COLORS.panelLine}`, borderRadius: 10, padding: "32px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 12, color: COLORS.orange, fontFamily: FONT_MONO, marginBottom: 8 }}>acesso ao diário</div>
        <h1 style={{ margin: "0 0 22px", fontSize: 21, fontWeight: 600, color: COLORS.cream }}>Diário de Obra</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu e-mail"
          autoFocus
          style={{ width: "100%", background: "#0B1E33", border: `1px solid ${COLORS.panelLine}`, borderRadius: 6, padding: "11px 12px", color: COLORS.cream, fontFamily: FONT_MONO, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 10 }}
        />
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="sua senha"
          style={{ width: "100%", background: "#0B1E33", border: `1px solid ${erro ? COLORS.red : COLORS.panelLine}`, borderRadius: 6, padding: "11px 12px", color: COLORS.cream, fontFamily: FONT_MONO, fontSize: 14, outline: "none", boxSizing: "border-box" }}
        />
        {erro && <div style={{ color: COLORS.red, fontSize: 12.5, marginTop: 8, fontFamily: FONT_MONO }}>{erro}</div>}
        <button type="submit" disabled={carregando} style={{ marginTop: 18, width: "100%", background: COLORS.orange, border: "none", borderRadius: 6, padding: "11px 12px", color: "#1A1305", fontFamily: FONT_HEAD, fontWeight: 600, fontSize: 14.5, cursor: "pointer", opacity: carregando ? 0.7 : 1 }}>
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

function InativoScreen({ onSair }) {
  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: FONT_HEAD }}>
      <div style={{ maxWidth: 360, textAlign: "center", color: COLORS.cream }}>
        <h2 style={{ fontSize: 19 }}>Acesso inativo</h2>
        <p style={{ color: COLORS.creamSoft, fontSize: 14 }}>
          Sua assinatura não está ativa no momento. Fale com quem te vendeu o acesso.
        </p>
        <button onClick={onSair} style={{ marginTop: 12, background: "transparent", border: `1px solid ${COLORS.panelLine}`, borderRadius: 6, padding: "9px 16px", color: COLORS.creamSoft, cursor: "pointer", fontFamily: FONT_HEAD }}>
          Sair
        </button>
      </div>
    </div>
  );
}

// ---------------- COMPONENTES DO FORMULÁRIO ----------------

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <div style={{ fontSize: 12.5, color: COLORS.creamSoft, marginBottom: 6, fontFamily: FONT_MONO }}>{label}</div>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%",
  background: "#0B1E33",
  border: `1px solid ${COLORS.panelLine}`,
  borderRadius: 6,
  padding: "10px 12px",
  color: COLORS.cream,
  fontFamily: FONT_HEAD,
  fontSize: 14.5,
  outline: "none",
  boxSizing: "border-box",
};

function ReadOnlyRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11.5, color: COLORS.orange, fontFamily: FONT_MONO, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14.5, color: COLORS.cream, whiteSpace: "pre-wrap" }}>{value}</div>
    </div>
  );
}

function DayPanel({ dateStr, initialEntry, onClose, onSaved, somenteLeitura, obraId, userId }) {
  const [clima, setClima] = useState(initialEntry?.clima || CLIMAS[0]);
  const [etapa, setEtapa] = useState(initialEntry?.etapa || "");
  const [descricao, setDescricao] = useState(initialEntry?.descricao || "");
  const [equipe, setEquipe] = useState(initialEntry?.equipe || "");
  const [materiais, setMateriais] = useState(initialEntry?.materiais || "");
  const [ocorrencias, setOcorrencias] = useState(initialEntry?.ocorrencias || "");
  const [fotos, setFotos] = useState(initialEntry?.fotos || []);
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState("");
  const [processandoFoto, setProcessandoFoto] = useState(false);

  const dataLegivel = dataLegivelDe(dateStr);

  async function handleFotos(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setProcessandoFoto(true);
    try {
      const novas = [];
      for (const f of files.slice(0, 4 - fotos.length)) {
        const dataUrl = await resizeImage(f);
        novas.push(dataUrl);
      }
      setFotos((prev) => [...prev, ...novas].slice(0, 4));
    } catch {
      setErroSalvar("Não foi possível processar uma das fotos.");
    } finally {
      setProcessandoFoto(false);
      e.target.value = "";
    }
  }

  function removerFoto(idx) {
    setFotos((prev) => prev.filter((_, i) => i !== idx));
  }

  async function salvar() {
    setSalvando(true);
    setErroSalvar("");
    const { error } = await supabase.from("entradas").upsert(
      {
        obra_id: obraId,
        data: dateStr,
        clima,
        etapa,
        descricao,
        equipe,
        materiais,
        ocorrencias,
        fotos,
        created_by: userId,
      },
      { onConflict: "obra_id,data" }
    );
    setSalvando(false);
    if (error) {
      setErroSalvar("Não foi possível salvar agora. Tente novamente.");
      return;
    }
    await onSaved(dateStr);
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(6,15,26,0.65)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto", zIndex: 50 }} onClick={onClose}>
      <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelLine}`, borderRadius: 10, padding: 24, width: "100%", maxWidth: 520, fontFamily: FONT_HEAD }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 12, color: COLORS.orange, fontFamily: FONT_MONO }}>registro do dia</div>
            <h2 style={{ margin: "4px 0 0", fontSize: 19, color: COLORS.cream, fontWeight: 600 }}>{dataLegivel}</h2>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: COLORS.creamSoft, fontSize: 22, cursor: "pointer", lineHeight: 1 }} aria-label="Fechar">×</button>
        </div>

        {somenteLeitura ? (
          <>
            <ReadOnlyRow label="Clima do dia" value={clima} />
            <ReadOnlyRow label="Etapa / serviço em execução" value={etapa} />
            <ReadOnlyRow label="Descrição do que foi feito" value={descricao} />
            <ReadOnlyRow label="Equipe presente" value={equipe} />
            <ReadOnlyRow label="Materiais utilizados" value={materiais} />
            <ReadOnlyRow label="Ocorrências / problemas" value={ocorrencias} />
            {fotos.length > 0 && (
              <div style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 11.5, color: COLORS.orange, fontFamily: FONT_MONO, marginBottom: 6 }}>Fotos do dia</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {fotos.map((src, i) => (
                    <img key={i} src={src} alt={`Foto ${i + 1}`} style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 6, border: `1px solid ${COLORS.panelLine}` }} />
                  ))}
                </div>
              </div>
            )}
            {!initialEntry && <div style={{ fontSize: 13.5, color: COLORS.creamSoft, fontFamily: FONT_MONO }}>Nenhum registro para este dia ainda.</div>}
          </>
        ) : (
          <>
            <Field label="Clima do dia">
              <select value={clima} onChange={(e) => setClima(e.target.value)} style={inputStyle}>
                {CLIMAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Etapa / serviço em execução">
              <input type="text" value={etapa} onChange={(e) => setEtapa(e.target.value)} placeholder="Ex: fundação, alvenaria, elétrica..." style={inputStyle} />
            </Field>
            <Field label="Descrição do que foi feito">
              <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            </Field>
            <Field label="Equipe presente">
              <input type="text" value={equipe} onChange={(e) => setEquipe(e.target.value)} placeholder="Ex: 4 pedreiros, 2 serventes" style={inputStyle} />
            </Field>
            <Field label="Materiais utilizados">
              <textarea value={materiais} onChange={(e) => setMateriais(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
            </Field>
            <Field label="Ocorrências / problemas">
              <textarea value={ocorrencias} onChange={(e) => setOcorrencias(e.target.value)} rows={2} placeholder="Ex: atraso de material, chuva parou o serviço às 14h..." style={{ ...inputStyle, resize: "vertical" }} />
            </Field>
            <Field label={`Fotos do dia (${fotos.length}/4)`}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: fotos.length ? 10 : 0 }}>
                {fotos.map((src, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <img src={src} alt={`Foto ${i + 1}`} style={{ width: 76, height: 76, objectFit: "cover", borderRadius: 6, border: `1px solid ${COLORS.panelLine}` }} />
                    <button onClick={() => removerFoto(i)} style={{ position: "absolute", top: -6, right: -6, background: COLORS.red, color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, fontSize: 13, cursor: "pointer", lineHeight: 1 }} aria-label="Remover foto">×</button>
                  </div>
                ))}
              </div>
              {fotos.length < 4 && (
                <label style={{ display: "inline-block", fontSize: 13, color: COLORS.orange, border: `1px dashed ${COLORS.orange}`, borderRadius: 6, padding: "8px 14px", cursor: "pointer" }}>
                  {processandoFoto ? "Processando..." : "+ Adicionar fotos"}
                  <input type="file" accept="image/*" multiple onChange={handleFotos} style={{ display: "none" }} disabled={processandoFoto} />
                </label>
              )}
            </Field>
            {erroSalvar && <div style={{ color: COLORS.red, fontSize: 13, marginBottom: 12, fontFamily: FONT_MONO }}>{erroSalvar}</div>}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={onClose} style={{ flex: 1, background: "transparent", border: `1px solid ${COLORS.panelLine}`, borderRadius: 6, padding: "11px 12px", color: COLORS.creamSoft, fontFamily: FONT_HEAD, fontSize: 14, cursor: "pointer" }}>Cancelar</button>
              <button onClick={salvar} disabled={salvando} style={{ flex: 1, background: COLORS.orange, border: "none", borderRadius: 6, padding: "11px 12px", color: "#1A1305", fontFamily: FONT_HEAD, fontWeight: 600, fontSize: 14, cursor: salvando ? "default" : "pointer", opacity: salvando ? 0.7 : 1 }}>
                {salvando ? "Salvando..." : "Salvar registro"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RelatorioMensal({ obraId, ano, mes, onClose }) {
  const [entradas, setEntradas] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      setCarregando(true);
      setErro("");
      const inicio = `${ano}-${pad(mes + 1)}-01`;
      const fim = `${ano}-${pad(mes + 1)}-${pad(new Date(ano, mes + 1, 0).getDate())}`;
      const { data, error } = await supabase
        .from("entradas")
        .select("*")
        .eq("obra_id", obraId)
        .gte("data", inicio)
        .lte("data", fim)
        .order("data", { ascending: true });
      if (!cancelado) {
        if (error) setErro("Não foi possível carregar todos os registros do mês.");
        else setEntradas(data);
        setCarregando(false);
      }
    }
    carregar();
    return () => { cancelado = true; };
  }, [obraId, ano, mes]);

  return (
    <div style={{ position: "fixed", inset: 0, background: COLORS.paper, overflowY: "auto", zIndex: 60, fontFamily: FONT_HEAD }}>
      <style>{`@media print { .no-print { display: none !important; } body { background: #fff; } }`}</style>
      <div className="no-print" style={{ position: "sticky", top: 0, background: COLORS.paper, borderBottom: `1px solid ${COLORS.panelLine}`, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13.5, color: COLORS.ink, fontFamily: FONT_MONO }}>Relatório de {MESES[mes]} de {ano}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => window.print()} style={{ background: COLORS.orange, border: "none", borderRadius: 6, padding: "9px 16px", color: "#1A1305", fontWeight: 600, fontFamily: FONT_HEAD, fontSize: 13.5, cursor: "pointer" }}>Imprimir / Salvar como PDF</button>
          <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${COLORS.ink}`, borderRadius: 6, padding: "9px 16px", color: COLORS.ink, fontFamily: FONT_HEAD, fontSize: 13.5, cursor: "pointer" }}>Fechar</button>
        </div>
      </div>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px 60px", color: COLORS.ink }}>
        <div style={{ textAlign: "center", marginBottom: 30, borderBottom: `2px solid ${COLORS.ink}`, paddingBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#7A745E", fontFamily: FONT_MONO, marginBottom: 6 }}>RELATÓRIO DE ANDAMENTO DE OBRA</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>{MESES[mes]} de {ano}</h1>
        </div>
        {carregando && <div style={{ textAlign: "center", fontFamily: FONT_MONO, fontSize: 13.5, color: "#7A745E" }}>Carregando registros do mês...</div>}
        {erro && <div style={{ textAlign: "center", fontFamily: FONT_MONO, fontSize: 13.5, color: COLORS.red }}>{erro}</div>}
        {entradas && entradas.length === 0 && <div style={{ textAlign: "center", fontFamily: FONT_MONO, fontSize: 13.5, color: "#7A745E" }}>Nenhum dia registrado neste mês ainda.</div>}
        {entradas && entradas.map((e) => (
          <div key={e.data} style={{ marginBottom: 28, pageBreakInside: "avoid" }}>
            <div style={{ fontSize: 16, fontWeight: 600, borderBottom: `1px solid #D9D2BC`, paddingBottom: 6, marginBottom: 10 }}>
              {dataLegivelDe(e.data)} <span style={{ fontWeight: 400, fontSize: 13, color: "#7A745E" }}>· {e.clima}</span>
            </div>
            {e.etapa && <div style={{ fontSize: 13.5, marginBottom: 6 }}><strong>Etapa: </strong>{e.etapa}</div>}
            {e.descricao && <div style={{ fontSize: 13.5, marginBottom: 6, whiteSpace: "pre-wrap" }}><strong>Descrição: </strong>{e.descricao}</div>}
            {e.equipe && <div style={{ fontSize: 13.5, marginBottom: 6 }}><strong>Equipe: </strong>{e.equipe}</div>}
            {e.materiais && <div style={{ fontSize: 13.5, marginBottom: 6, whiteSpace: "pre-wrap" }}><strong>Materiais: </strong>{e.materiais}</div>}
            {e.ocorrencias && <div style={{ fontSize: 13.5, marginBottom: 6, whiteSpace: "pre-wrap" }}><strong>Ocorrências: </strong>{e.ocorrencias}</div>}
            {e.fotos && e.fotos.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {e.fotos.map((src, i) => <img key={i} src={src} alt="" style={{ width: 140, height: 140, objectFit: "cover", borderRadius: 4, border: "1px solid #D9D2BC" }} />)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- APP PRINCIPAL (por obra) ----------------

function DiaryApp({ perfil, onSair }) {
  const { obra_id: obraId, papel } = perfil;
  const somenteLeitura = papel === "visualizar";
  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth());
  const [preenchidos, setPreenchidos] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [entradaSelecionada, setEntradaSelecionada] = useState(null);
  const [carregandoEntrada, setCarregandoEntrada] = useState(false);
  const [mostrarRelatorio, setMostrarRelatorio] = useState(false);

  const carregarMes = useCallback(async () => {
    setCarregando(true);
    const inicio = `${ano}-${pad(mes + 1)}-01`;
    const fim = `${ano}-${pad(mes + 1)}-${pad(new Date(ano, mes + 1, 0).getDate())}`;
    const { data, error } = await supabase
      .from("entradas")
      .select("data")
      .eq("obra_id", obraId)
      .gte("data", inicio)
      .lte("data", fim);
    if (!error && data) {
      const mapa = {};
      data.forEach((row) => (mapa[row.data] = true));
      setPreenchidos(mapa);
    }
    setCarregando(false);
  }, [obraId, ano, mes]);

  useEffect(() => {
    carregarMes();
  }, [carregarMes]);

  async function abrirDia(dateStr) {
    if (somenteLeitura && !preenchidos[dateStr]) return;
    setDiaSelecionado(dateStr);
    if (preenchidos[dateStr]) {
      setCarregandoEntrada(true);
      const { data } = await supabase.from("entradas").select("*").eq("obra_id", obraId).eq("data", dateStr).maybeSingle();
      setEntradaSelecionada(data || null);
      setCarregandoEntrada(false);
    } else {
      setEntradaSelecionada(null);
    }
  }

  async function aoSalvar(dateStr) {
    setPreenchidos((prev) => ({ ...prev, [dateStr]: true }));
  }

  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const celulas = [];
  for (let i = 0; i < primeiroDiaSemana; i++) celulas.push(null);
  for (let d = 1; d <= diasNoMes; d++) celulas.push(d);

  function mudarMes(delta) {
    let novoMes = mes + delta;
    let novoAno = ano;
    if (novoMes < 0) { novoMes = 11; novoAno -= 1; }
    else if (novoMes > 11) { novoMes = 0; novoAno += 1; }
    setMes(novoMes);
    setAno(novoAno);
  }

  const totalPreenchidosNoMes = Object.keys(preenchidos).length;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, padding: "32px 16px", boxSizing: "border-box", fontFamily: FONT_HEAD }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12.5, color: COLORS.orange, letterSpacing: 0.4, marginBottom: 6, fontFamily: FONT_MONO }}>
              {somenteLeitura ? "acompanhamento de obra · visão do cliente" : "acompanhamento de obra"}
            </div>
            <h1 style={{ margin: 0, fontSize: 27, color: COLORS.cream, fontWeight: 600 }}>Diário de Obra</h1>
            <p style={{ margin: "8px 0 0", color: COLORS.creamSoft, fontSize: 14, maxWidth: 420 }}>
              {somenteLeitura ? "Acompanhe os dias já registrados pela equipe." : "Clique em um dia para registrar o andamento."}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setMostrarRelatorio(true)} style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelLine}`, borderRadius: 6, color: COLORS.cream, padding: "10px 14px", cursor: "pointer", fontFamily: FONT_HEAD, fontSize: 13 }}>
              Gerar relatório
            </button>
            <button onClick={onSair} style={{ background: "transparent", border: `1px solid ${COLORS.panelLine}`, borderRadius: 6, color: COLORS.creamSoft, padding: "10px 14px", cursor: "pointer", fontFamily: FONT_HEAD, fontSize: 13 }}>
              Sair
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <button onClick={() => mudarMes(-1)} style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelLine}`, borderRadius: 6, color: COLORS.cream, padding: "8px 14px", cursor: "pointer" }}>←</button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 17, color: COLORS.cream, fontWeight: 600 }}>{MESES[mes]} de {ano}</div>
            <div style={{ fontSize: 12, color: COLORS.creamSoft, fontFamily: FONT_MONO, marginTop: 2 }}>{totalPreenchidosNoMes} de {diasNoMes} dias registrados</div>
          </div>
          <button onClick={() => mudarMes(1)} style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelLine}`, borderRadius: 6, color: COLORS.cream, padding: "8px 14px", cursor: "pointer" }}>→</button>
        </div>

        <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelLine}`, borderRadius: 10, padding: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 8 }}>
            {DIAS_SEMANA.map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: 11.5, color: COLORS.creamSoft, fontFamily: FONT_MONO }}>{d}</div>)}
          </div>
          {carregando ? (
            <div style={{ textAlign: "center", color: COLORS.creamSoft, fontSize: 13.5, padding: "20px 0", fontFamily: FONT_MONO }}>Carregando calendário...</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
              {celulas.map((d, i) => {
                if (d === null) return <div key={i} />;
                const key = dateKey(ano, mes, d);
                const preenchido = !!preenchidos[key];
                const isHoje = key === todayKey();
                const clicavel = !somenteLeitura || preenchido;
                return (
                  <button key={i} onClick={() => abrirDia(key)} disabled={!clicavel} style={{ aspectRatio: "1", background: preenchido ? "rgba(78,158,118,0.16)" : COLORS.grid, border: isHoje ? `1.5px solid ${COLORS.orange}` : `1px solid ${COLORS.panelLine}`, borderRadius: 6, color: clicavel ? COLORS.cream : COLORS.creamSoft, fontFamily: FONT_MONO, fontSize: 13, cursor: clicavel ? "pointer" : "default", opacity: clicavel ? 1 : 0.45, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {d}
                    {preenchido && <span style={{ position: "absolute", bottom: 4, width: 5, height: 5, borderRadius: "50%", background: COLORS.green }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {diaSelecionado && !carregandoEntrada && (
        <DayPanel dateStr={diaSelecionado} initialEntry={entradaSelecionada} onClose={() => setDiaSelecionado(null)} onSaved={aoSalvar} somenteLeitura={somenteLeitura} obraId={obraId} userId={perfil.id} />
      )}
      {diaSelecionado && carregandoEntrada && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(6,15,26,0.65)", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.cream, fontFamily: FONT_MONO, fontSize: 14, zIndex: 50 }}>Carregando registro...</div>
      )}
      {mostrarRelatorio && <RelatorioMensal obraId={obraId} ano={ano} mes={mes} onClose={() => setMostrarRelatorio(false)} />}
    </div>
  );
}

// ---------------- CONTROLE DE SESSÃO / PERFIL ----------------

export default function App() {
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [erroPerfil, setErroPerfil] = useState("");

  const carregarPerfil = useCallback(async (userId) => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error || !data) {
      setErroPerfil("Não encontramos um perfil vinculado a este login. Fale com quem te vendeu o acesso.");
      return;
    }
    setPerfil(data);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser(data.session.user);
        carregarPerfil(data.session.user.id).finally(() => setCarregandoSessao(false));
      } else {
        setCarregandoSessao(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        carregarPerfil(session.user.id);
      } else {
        setUser(null);
        setPerfil(null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [carregarPerfil]);

  async function sair() {
    await supabase.auth.signOut();
    setUser(null);
    setPerfil(null);
  }

  if (carregandoSessao) {
    return <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.creamSoft, fontFamily: FONT_MONO }}>Carregando...</div>;
  }
  if (!user) {
    return <LoginScreen onLogged={(u) => { setUser(u); carregarPerfil(u.id); }} />;
  }
  if (erroPerfil) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: FONT_HEAD }}>
        <div style={{ maxWidth: 360, textAlign: "center", color: COLORS.cream }}>
          <p style={{ color: COLORS.creamSoft, fontSize: 14 }}>{erroPerfil}</p>
          <button onClick={sair} style={{ marginTop: 12, background: "transparent", border: `1px solid ${COLORS.panelLine}`, borderRadius: 6, padding: "9px 16px", color: COLORS.creamSoft, cursor: "pointer", fontFamily: FONT_HEAD }}>Sair</button>
        </div>
      </div>
    );
  }
  if (!perfil) {
    return <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.creamSoft, fontFamily: FONT_MONO }}>Carregando perfil...</div>;
  }
  if (!perfil.ativo) {
    return <InativoScreen onSair={sair} />;
  }
  return <DiaryApp perfil={perfil} onSair={sair} />;
}
