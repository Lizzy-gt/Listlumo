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
import TarefaItem from "../components/ListaItem";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Chave única usada para identificar onde os dados do app serão salvos no armazenamento interno do celular
const CHAVE_STORAGE = "@rn-storage-lesson:compras";

export default function ListaComprasScreen() {
  //  ESTADOS DA APLICAÇÃO
  const [compras, setCompras] = useState([]); // Lista principal contendo os objetos de cada compra
  const [textoInput, setTextoInput] = useState(""); // Texto digitado no campo de 'Nova Compra'
  const [carregando, setCarregando] = useState(true); // Flag para evitar que o app salve dados antes de carregar os antigos

  // Estados para controle da janela de edição (Modal)
  const [compraEditando, setCompraEditando] = useState(null); // Guarda a compra selecionada para edição (null = modal fechado)
  const [textoEdicao, setTextoEdicao] = useState(""); // Guarda o texto digitado dentro do modal

  // FUNCAO DE CARREGAMENTO (Executa apenas 1 vez ao abrir a tela)
  useEffect(() => {
    async function carregarCompras() {
      try {
        // Busca a string salva no AsyncStorage
        const comprasSalvas = await AsyncStorage.getItem(CHAVE_STORAGE);
        // Se encontrou dados salvos, converte a string de volta para Array de objetos (JSON.parse)
        if (comprasSalvas !== null) {
          setCompras(JSON.parse(comprasSalvas));
        }
      } catch (erro) {
        console.error("Erro ao carregar item do storage:", erro);
      } finally {
        // Finaliza o carregamento permitindo que o efeito de salvamento volte a funcionar
        setCarregando(false);
      }
    }
    carregarCompras();
  }, []); // Array vazio [] garante execução única na montagem do componente

  // FUNCAO DE SALVAMENTO AUTOMÁTICO (Executa toda vez que a lista 'compras' muda)
  useEffect(() => {
    // TRAVA DE SEGURANÇA: Impede que o app sobrescreva o AsyncStorage com lista vazia enquanto ainda carrega os dados
    if (carregando) return;

    // Converte a lista de objetos em texto (JSON.stringify) para poder gravar no armazenamento do dispositivo
    AsyncStorage.setItem(CHAVE_STORAGE, JSON.stringify(compras)).catch((erro) => {
      console.error("Erro ao salvar a item no storage:", erro);
    });
  }, [compras, carregando]);

  // FUNÇÕES DE MANIPULAÇÃO DA LISTA

  // Adiciona uma nova compra na lista
  function adicionarCompra() {
    const texto = textoInput.trim(); // Remove espaços em branco desnecessários no início e fim
    if (texto === '') return; // Impede adicionar compras vazias

    // Cria o objeto da nova compra com ID único baseado no timestamp atual
    const novaCompra = {
      id: Date.now().toString(),
      texto,
      concluida: false,
    };

    // Atualiza o estado mantendo o histórico anterior (...comprasAtuais) e inserindo o novo item no final
    setCompras((comprasAtuais) => [...comprasAtuais, novaCompra]);
    setTextoInput(""); // Limpa o campo de entrada do formulário
  }

  // Alterna o status de concluída/pendente de uma compra
  function alternarConcluida(id) {
    setCompras((comprasAtuais) =>
      // .map percorre todos os itens e retorna uma NOVA lista.
      // Se encontrar o ID selecionado, cria uma cópia mudando a propriedade 'concluida'.
      comprasAtuais.map((compra) =>
        compra.id === id ? { ...compra, concluida: !compra.concluida } : compra
      )
    );
  }

  // Remove uma compra específica pelo ID
  function excluirCompra(id) {
    setCompras((comprasAtuais) =>
      // .filter cria uma nova lista contendo APENAS as compras que possuem ID diferente do selecionado
      comprasAtuais.filter((compra) => compra.id !== id)
    );
  }

  // Limpa todas as compras da lista com confirmação do usuário
  function limparTodasCompras() {
    if (compras.length === 0) return;

    // Exibe caixa de diálogo nativa do sistema para evitar exclusões acidentais
    Alert.alert(
      "Limpar Tudo",
      "Tem certeza de que deseja apagar todas as compras?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar Tudo",
          style: "destructive",
          onPress: () => setCompras([]), // Redefine o estado para um array vazio
        },
      ]
    );
  }

  // Abre a janela de edição preenchendo os dados do item clicado
  function iniciarEdicao(compra) {
    setCompraEditando(compra); // Salva o objeto completo da compra que será editada (ativa a visibilidade do Modal)
    setTextoEdicao(compra.texto); // Preenche o campo de texto do modal com a descrição atual
  }

  // Salva o novo texto da compra editada
  function salvarEdicao() {
    const textoFormatado = textoEdicao.trim();
    if (textoFormatado === "") return; // Evita salvar texto vazio

    // Percorre a lista e substitui o texto apenas no item cujo ID corresponde à compra em edição
    setCompras((comprasAtuais) =>
      comprasAtuais.map((compra) =>
        compra.id === compraEditando.id
          ? { ...compra, texto: textoFormatado }
          : compra
      )
    );

    // Reseta os estados de edição, o que fecha a janela Modal automaticamente
    setCompraEditando(null);
    setTextoEdicao("");
  }

  return (
    <KeyboardAvoidingView  // Ajusta a tela automaticamente quando o teclado virtual é aberto
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined} // Aplica padding apenas no iOS para evitar sobreposição do teclado
    >
      <Text style={styles.titulo}>Lista de Compras</Text>

      {/* Formulário para adicionar compra */}
      <View style={styles.formulario}>
        <TextInput
          style={styles.input}
          placeholder="Digite uma nova compra..."
          value={textoInput}
          onChangeText={setTextoInput}
          onSubmitEditing={adicionarCompra} // Permite enviar pressionando 'Concluído/Enter' no teclado
          returnKeyType="done"
        />
        <TouchableOpacity
          style={styles.botaoAdicionar}
          onPress={adicionarCompra}
        >
          <Text style={styles.textoBotaoAdicionar}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      {/* Botão de Limpar Todas as compras (Exibido apenas se houver pelo menos 1 item) */}
      {compras.length > 0 && (
        <TouchableOpacity
          style={styles.botaoLimpar}
          onPress={limparTodasCompras}
        >
          <Text style={styles.textoBotaoLimpar}>Limpar tudo</Text>
        </TouchableOpacity>
      )}

      {/* Lista de Exibição */}
      <FlatList
        data={compras}
        keyExtractor={(compra) => compra.id}
        renderItem={({ item }) => (
          <TarefaItem
            tarefa={item}
            aoAlternarConcluida={alternarConcluida}
            aoExcluir={excluirCompra}
            aoEditar={() => iniciarEdicao(item)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.listaVazia}>
            Nenhuma compra cadastrada ainda.
          </Text>
        }
        contentContainerStyle={styles.listaConteudo}
      />

      {/* Modal de Edição (Exibido se 'compraEditando' não for nulo: !!compraEditando) */}
      <Modal
        visible={!!compraEditando}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCompraEditando(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalConteudo}>
            <Text style={styles.modalTitulo}>Editar compra</Text>
            <TextInput
              style={styles.modalInput}
              value={textoEdicao}
              onChangeText={setTextoEdicao}
              autoFocus // Foca o cursor no input automaticamente assim que o modal abre
            />
            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={[styles.modalBotao, styles.botaoCancelar]}
                onPress={() => setCompraEditando(null)}
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