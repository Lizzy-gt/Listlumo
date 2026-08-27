import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import TarefaItem from "../components/TarefaItem";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Chave única usada para identificar onde os dados do app serão salvos no armazenamento interno do celular
const CHAVE_STORAGE = "@rn-storage-lesson:tarefas";

export default function ListaTarefasScreen() {
  //  ESTADOS DA APLICAÇÃO
  const [tarefas, setTarefas] = useState([]); // Lista principal contendo os objetos de cada tarefa
  const [textoInput, setTextoInput] = useState(""); // Texto digitado no campo de 'Nova Tarefa'
  const [carregando, setCarregando] = useState(true); // Flag para evitar que o app salve dados antes de carregar os antigos

  // Estados para controle da janela de edição (Modal)
  const [tarefaEditando, setTarefaEditando] = useState(null); // Guarda a tarefa selecionada para edição (null = modal fechado)
  const [textoEdicao, setTextoEdicao] = useState(""); // Guarda o texto digitado dentro do modal

  // FUNCAO DE CARREGAMENTO (Executa apenas 1 vez ao abrir a tela) ===
  useEffect(() => {
    async function carregarTarefas() {
      try {
        // Busca a string salva no AsyncStorage
        const tarefasSalvas = await AsyncStorage.getItem(CHAVE_STORAGE);
        // Se encontrou dados salvos, converte a string de volta para Array de objetos (JSON.parse)
        if (tarefasSalvas !== null) {
          setTarefas(JSON.parse(tarefasSalvas));
        }
      } catch (erro) {
        console.error("Erro ao carregar tarefas do storage:", erro);
      } finally {
        // Finaliza o carregamento permitindo que o efeito de salvamento volte a funcionar
        setCarregando(false);
      }
    }
    carregarTarefas();
  }, []); // Array vazio [] garante execução única na montagem do componente

  // FUNCAO DE SALVAMENTO AUTOMÁTICO (Executa toda vez que a lista 'tarefas' muda) 
  useEffect(() => {
    // TRAVA DE SEGURANÇA: Impede que o app sobrescreva o AsyncStorage com lista vazia enquanto ainda carrega os dados
    if (carregando) return;

    // Converte a lista de objetos em texto (JSON.stringify) para poder gravar no armazenamento do dispositivo
    AsyncStorage.setItem(CHAVE_STORAGE, JSON.stringify(tarefas)).catch((erro) => {
      console.error("Erro ao salvar a tarefa no storage:", erro);
    });
  }, [tarefas, carregando]);

  // FUNÇÕES DE MANIPULAÇÃO DA LISTA

  // Adiciona uma nova tarefa na lista
  function adicionarTarefa() {
    const texto = textoInput.trim(); // Remove espaços em branco desnecessários no início e fim
    if (texto === '') return; // Impede adicionar tarefas vazias

    // Cria o objeto da nova tarefa com ID único baseado no timestamp atual
    const novaTarefa = {
      id: Date.now().toString(),
      texto,
      concluida: false,
    };

    // Atualiza o estado mantendo o histórico anterior (...tarefasAtuais) e inserindo o novo item no final
    setTarefas((tarefasAtuais) => [...tarefasAtuais, novaTarefa]);
    setTextoInput(""); // Limpa o campo de entrada do formulário
  }

  // Alterna o status de concluída/pendente de uma tarefa
  function alternarConcluida(id) {
    setTarefas((tarefasAtuais) =>
      // .map percorre todos os itens e retorna uma NOVA lista.
      // Se encontrar o ID selecionado, cria uma cópia mudando a propriedade 'concluida'.
      tarefasAtuais.map((tarefa) =>
        tarefa.id === id ? { ...tarefa, concluida: !tarefa.concluida } : tarefa
      )
    );
  }

  // Remove uma tarefa específica pelo ID
  function excluirTarefa(id) {
    setTarefas((tarefasAtuais) =>
      // .filter cria uma nova lista contendo APENAS as tarefas que possuem ID diferente do selecionado
      tarefasAtuais.filter((tarefa) => tarefa.id !== id)
    );
  }

  // Limpa todas as tarefas da lista com confirmação do usuário
  function limparTodasTarefas() {
    if (tarefas.length === 0) return;

    // Exibe caixa de diálogo nativa do sistema para evitar exclusões acidentais
    Alert.alert(
      "Limpar Tudo",
      "Tem certeza de que deseja apagar todas as tarefas?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar Tudo",
          style: "destructive",
          onPress: () => setTarefas([]), // Redefine o estado para um array vazio
        },
      ]
    );
  }

  // Abre a janela de edição preenchendo os dados do item clicado
  function iniciarEdicao(tarefa) {
    setTarefaEditando(tarefa); // Salva o objeto completo da tarefa que será editada (ativa a visibilidade do Modal)
    setTextoEdicao(tarefa.texto); // Preenche o campo de texto do modal com a descrição atual
  }

  // Salva o novo texto da tarefa editada
  function salvarEdicao() {
    const textoFormatado = textoEdicao.trim();
    if (textoFormatado === "") return; // Evita salvar texto vazio

    // Percorre a lista e substitui o texto apenas no item cujo ID corresponde à tarefa em edição
    setTarefas((tarefasAtuais) =>
      tarefasAtuais.map((tarefa) =>
        tarefa.id === tarefaEditando.id
          ? { ...tarefa, texto: textoFormatado }
          : tarefa
      )
    );

    // Reseta os estados de edição, o que fecha a janela Modal automaticamente
    setTarefaEditando(null);
    setTextoEdicao("");
  }

  return (
    <KeyboardAvoidingView  // Ajusta a tela automaticamente quando o teclado virtual é aberto
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined} // Aplica padding apenas no iOS para evitar sobreposição do teclado
    >
      <Text style={styles.titulo}>Lista de Tarefas</Text>

      {/* Formulário de Adição */}
      <View style={styles.formulario}>
        <TextInput
          style={styles.input}
          placeholder="Digite uma nova tarefa..."
          value={textoInput}
          onChangeText={setTextoInput}
          onSubmitEditing={adicionarTarefa} // Permite enviar pressionando 'Concluído/Enter' no teclado
          returnKeyType="done"
        />
        <TouchableOpacity
          style={styles.botaoAdicionar}
          onPress={adicionarTarefa}
        >
          <Text style={styles.textoBotaoAdicionar}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      {/* Botão de Limpar Todas as Tarefas (Exibido apenas se houver pelo menos 1 tarefa) */}
      {tarefas.length > 0 && (
        <TouchableOpacity
          style={styles.botaoLimpar}
          onPress={limparTodasTarefas}
        >
          <Text style={styles.textoBotaoLimpar}>Limpar tudo</Text>
        </TouchableOpacity>
      )}

      {/* Lista de Exibição */}
      <FlatList
        data={tarefas}
        keyExtractor={(tarefa) => tarefa.id}
        renderItem={({ item }) => (
          <TarefaItem
            tarefa={item}
            aoAlternarConcluida={alternarConcluida}
            aoExcluir={excluirTarefa}
            aoEditar={() => iniciarEdicao(item)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.listaVazia}>
            Nenhuma tarefa cadastrada ainda.
          </Text>
        }
        contentContainerStyle={styles.listaConteudo}
      />

      {/* Modal de Edição (Exibido se 'tarefaEditando' não for nulo: !!tarefaEditando) */}
      <Modal
        visible={!!tarefaEditando}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setTarefaEditando(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalConteudo}>
            <Text style={styles.modalTitulo}>Editar Tarefa</Text>
            <TextInput
              style={styles.modalInput}
              value={textoEdicao}
              onChangeText={setTextoEdicao}
              autoFocus // Foca o cursor no input automaticamente assim que o modal abre
            />
            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={[styles.modalBotao, styles.botaoCancelar]}
                onPress={() => setTarefaEditando(null)}
              >
                <Text style={styles.textoBotaoModal}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBotao, styles.botaoSalvar]}
                onPress={salvarEdicao}
              >
                <Text style={styles.textoBotaoModal}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  formulario: {
    flexDirection: "row",
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  botaoAdicionar: {
    backgroundColor: "#2e86de",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  textoBotaoAdicionar: {
    color: "#fff",
    fontWeight: "bold",
  },
  botaoLimpar: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  textoBotaoLimpar: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  listaConteudo: {
    paddingBottom: 20,
  },
  listaVazia: {
    textAlign: "center",
    color: "#888",
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalConteudo: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  modalBotoes: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  modalBotao: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  botaoCancelar: {
    backgroundColor: "#888",
  },
  botaoSalvar: {
    backgroundColor: "#2e86de",
  },
  textoBotaoModal: {
    color: "#fff",
    fontWeight: "bold",
  },
});

