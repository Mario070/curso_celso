document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formularioCurso');

    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();

        // --- DADOS DO CURSO ---
        const tituloCurso = document.getElementById('nomecurso').value.trim();
        const categoria = document.getElementById('categoriacurso').value.trim();
        const descricao = document.getElementById('descricao_curso').value.trim();

        // --- DADOS DO MÓDULO ---
        const tituloModulo = document.getElementById('tituloModulo').value.trim(); // precisa existir no HTML
        const ordemModulo = 1;

        // --- DADOS DO VÍDEO ---
        const tituloVideo = document.getElementById('titulovideo').value.trim();
        const linkVideo = document.getElementById('linkvideo').value.trim();
        const tempoVideo = document.getElementById('tempoVideo').value;

        // 1. Converter tempo do vídeo para minutos
        const [hora = "0", minuto = "0", segundo = "0"] = (tempoVideo || "00:00:00").split(":");
        const duracao = parseInt(hora) * 60 + parseInt(minuto) + (parseInt(segundo) >= 30 ? 1 : 0);

        try {
            // 2. Salvar CURSO
            const cursoRes = await fetch('http://localhost:3000/api/salvar-curso', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titulo: tituloCurso, categoria, descricao, cargaHoraria: duracao })
            });

            const cursoData = await cursoRes.json();
            if (!cursoRes.ok) throw new Error(cursoData.error || 'Erro ao salvar curso');

            const cursoId = cursoData.id;

            // 3. Salvar MÓDULO
            const moduloRes = await fetch('http://localhost:3000/api/salvar-modulo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cursoId, titulo: tituloModulo, ordem: ordemModulo })
            });

            const moduloData = await moduloRes.json();
            if (!moduloRes.ok) throw new Error(moduloData.error || 'Erro ao salvar módulo');

            const moduloId = moduloData.modulo.id;

            // 4. Salvar VÍDEO
            const videoRes = await fetch('http://localhost:3000/api/salvar-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titulovideo: tituloVideo,
                    linkvideo: linkVideo,
                    tempoVideo,
                    moduloId
                })
            });

            const videoData = await videoRes.json();
            if (!videoRes.ok) throw new Error(videoData.error || 'Erro ao salvar vídeo');

            const linkApostila = document.getElementById('linkapostila').value.trim();
            const nomeApostila = document.getElementById('nomeApostila').value.trim();

            if (!linkApostila || !nomeApostila) {
                alert('Por favor, preencha todos os campos da apostila.');
                return;
            }

            try {
                const apostilaRes = await fetch('http://localhost:3000/api/salvar-apostila', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        moduloId,
                        titulo: nomeApostila,
                        arquivoUrl: linkApostila
                    }),
                });

                const apostilaData = await apostilaRes.json();
                if (!apostilaRes.ok) throw new Error(apostilaData.error || 'Erro ao salvar apostila');

                alert("Apostila salva com sucesso!");

            } catch (erro) {
                console.error('Erro ao salvar apostila:', erro);
                alert('Erro ao salvar apostila: ' + erro.message);
            }

           const tituloAvaliacao = document.getElementById('tituloAvaliacao').value.trim();
const linkAvaliacao = document.getElementById('linkAvaliacao').value.trim();

try {
  const avaliacaoRes = await fetch('http://localhost:3000/api/salvar-avaliacao', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      moduloId,
      titulo: tituloAvaliacao,
      url: linkAvaliacao,  // agora usa o campo "url"
    }),
  });

  const avaliacaoData = await avaliacaoRes.json();
  if (!avaliacaoRes.ok) throw new Error(avaliacaoData.error || 'Erro ao salvar avaliação');

  alert('Avaliação salva com sucesso!');
} catch (erro) {
  console.error('Erro ao salvar avaliação:', erro);
  alert('Erro ao salvar avaliação: ' + erro.message);
}
            alert("Curso, módulo e vídeo salvos com sucesso!");
            formulario.reset();
        } catch (erro) {
            console.error('Erro no envio:', erro);
            alert('Erro: ' + erro.message);
        }
    })
});
