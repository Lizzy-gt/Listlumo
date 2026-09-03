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
import ItemCompra from "../components/ListaItem";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Chave única usada para identificar onde os dados do app serão salvos no armazenamento interno do celular
const CHAVE_STORAGE = "@rn-storage-lesson:compras";

export default function ListaComprasScreen() {
  //  ESTADOS DA APLICAÇÃO
  const [compras, setCompras] = useState([]); // Lista principal contendo os objetos de cada compra
  const [textoInput, setTextoInput] = useState(""); // Texto digitado no campo de 'Nova Compra'
  const [carregando, setCarregando] = useState(true); // Flag para evitar que o app salve dados antes de carregar os antigos
  const [modoEscuro, setModoEscuro] = useState(false);

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
      nome: texto,
      comprado: false,
    };

    // Atualiza o estado mantendo o histórico anterior (...comprasAtuais) e inserindo o novo item no final
    setCompras((comprasAtuais) => [...comprasAtuais, novaCompra]);
    setTextoInput(""); // Limpa o campo de entrada do formulário
  }

  // Alterna o status de concluída/pendente de uma compra
  function alternarConcluida(id) {
    setCompras((comprasAtuais) =>
      // .map percorre todos os itens e retorna uma NOVA lista.
      // Se encontrar o ID selecionado, cria uma cópia mudando a propriedade 'comprado'.
      comprasAtuais.map((compra) =>
        compra.id === id ? { ...compra, comprado: !compra.comprado } : compra
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
    setTextoEdicao(compra.nome); // Preenche o campo de texto do modal com a descrição atual
  }

  // Salva o novo texto da compra editada
  function salvarEdicao() {
    const textoFormatado = textoEdicao.trim();
    if (textoFormatado === "") return; // Evita salvar texto vazio

    // Percorre a lista e substitui o texto apenas no item cujo ID corresponde à compra em edição
    setCompras((comprasAtuais) =>
      comprasAtuais.map((compra) =>
        compra.id === compraEditando.id
          ? { ...compra, nome: textoFormatado }
          : compra
      )
    );

    // Reseta os estados de edição, o que fecha a janela Modal automaticamente
    setCompraEditando(null);
    setTextoEdicao("");
  }

  return (
    <KeyboardAvoidingView  // Ajusta a tela automaticamente quando o teclado virtual é aberto
      style={[styles.container, modoEscuro && styles.containerEscuro]}
      behavior={Platform.OS === "ios" ? "padding" : undefined} // Aplica padding apenas no iOS para evitar sobreposição do teclado
    >
      <View style={styles.cabecalho}>
        <Text style={[styles.titulo, modoEscuro && styles.textoClaro]}>
          🛒 Lista de Compras do Mês
        </Text>
        <TouchableOpacity
          style={[styles.botaoTema, modoEscuro && styles.botaoTemaEscuro]}
          onPress={() => setModoEscuro((temaAtual) => !temaAtual)}
          accessibilityRole="button"
          accessibilityLabel={modoEscuro ? "Ativar modo claro" : "Ativar modo escuro"}
        >
          <Text
            style={[styles.textoBotaoTema, modoEscuro && styles.textoBotaoTemaEscuro]}
          >
            {modoEscuro ? "Modo claro" : "Modo escuro"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Formulário para adicionar compra */}
      <View style={styles.formulario}>
        <TextInput
          style={[styles.input, modoEscuro && styles.inputEscuro]}
          placeholder="Digite uma nova compra..."
          placeholderTextColor={modoEscuro ? "#A7B8AD" : "#777"}
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
          <ItemCompra
            item={item}
            modoEscuro={modoEscuro}
            aoAlternarComprado={alternarConcluida}
            aoExcluir={excluirCompra}
            aoEditar={() => iniciarEdicao(item)}
          />
        )}
        ListEmptyComponent={
          <Text style={[styles.listaVazia, modoEscuro && styles.textoClaro]}>
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
        <View style={[styles.modalOverlay, modoEscuro && styles.modalOverlayEscuro]}>
          <View style={[styles.modalConteudo, modoEscuro && styles.modalConteudoEscuro]}>
            <Text style={[styles.modalTitulo, modoEscuro && styles.textoClaro]}>Editar compra</Text>
            <TextInput
              style={[styles.modalInput, modoEscuro && styles.inputEscuro]}
              placeholderTextColor={modoEscuro ? "#A7B8AD" : "#777"}
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
    backgroundColor: "#F7F7F2", // off-white
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  containerEscuro: {
    backgroundColor: "#17211B",
  },
  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1F3D2B", // verde bem escuro
    flex: 1,
  },
  textoClaro: {
    color: "#F1F7F2",
  },
  botaoTema: {
    backgroundColor: "#E4EEE5",
    borderRadius: 8,
    minWidth: 104,
    height: 40,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoTemaEscuro: {
    backgroundColor: "#30483A",
  },
  textoBotaoTema: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1F3D2B",
  },
  textoBotaoTemaEscuro: {
    color: "#F1F7F2",
  },
  formulario: {
    flexDirection: "row",
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#CBD9CD", // verde bem claro
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  inputEscuro: {
    backgroundColor: "#25352B",
    borderColor: "#4C6B58",
    color: "#F1F7F2",
  },
  botaoAdicionar: {
    backgroundColor: "#2F6B4F", // verde médio
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  textoBotaoAdicionar: {
    color: "#fff",
    fontWeight: "bold",
  },
  botaoLimpar: {
    backgroundColor: "#7A9E85", // verde acinzentado, mais suave que o de adicionar
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
    color: "#8FA396",
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(31,61,43,0.5)", // overlay esverdeado escuro
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlayEscuro: {
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  modalConteudo: {
    width: "85%",
    backgroundColor: "#F7F7F2",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalConteudoEscuro: {
    backgroundColor: "#25352B",
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1F3D2B",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#CBD9CD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    backgroundColor: "#fff",
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
    backgroundColor: "#9AAA9E",
  },
  botaoSalvar: {
    backgroundColor: "#2F6B4F",
  },
  textoBotaoModal: {
    color: "#fff",
    fontWeight: "bold",
  },
})