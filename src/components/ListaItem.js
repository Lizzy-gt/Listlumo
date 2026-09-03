import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function ItemCompra({
  item,
  aoAlternarComprado,
  aoExcluir,
  aoEditar,
  // Recebe o tema da tela para adaptar a aparencia de cada item.
  modoEscuro,
}) {
  return (
    // O item troca o fundo e a borda lateral quando o modo escuro esta ativo.
    <View style={[styles.item, modoEscuro && styles.itemEscuro]}>
      <TouchableOpacity
        style={styles.textoContainer}
        onPress={() => aoAlternarComprado(item.id)}
        onLongPress={aoEditar} // toque longo abre o modal de edição
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.comprado }}
        accessibilityLabel={item.nome}
      >
        <View
          style={[styles.checkbox, item.comprado && styles.checkboxMarcado]}
        >
          {item.comprado && <Text style={styles.check}>✓</Text>}
        </View>
        <Text
          style={[
            styles.texto,
            // Deixa o nome claro para continuar legivel no fundo escuro.
            modoEscuro && styles.textoClaro,
            item.comprado && styles.textoComprado,
          ]}
        >
          {item.nome}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoEditar}
        onPress={() => aoEditar(item)}
        accessibilityRole="button"
        accessibilityLabel={`Editar ${item.nome}`}
      >
        <Text style={styles.textoBotaoEditar}>Editar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoExcluir}
        onPress={() => aoExcluir(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`Excluir ${item.nome}`}
      >
        <Text style={styles.textoBotaoExcluir}>Excluir</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F7F7F2",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#2F6B4F", // detalhe verde na lateral do card
    // Sombra leve só para destacar o card (funciona em iOS e Android)
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  itemEscuro: {
    // Cores do card de compra no modo escuro.
    backgroundColor: "#25352B",
    borderLeftColor: "#74B58B",
  },
  textoContainer: {
    flex: 1,
    marginRight: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#CBD9CD",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxMarcado: {
    backgroundColor: "#2F6B4F",
    borderColor: "#2F6B4F",
  },
  check: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  texto: {
    fontSize: 16,
    color: "#1F3D2B",
  },
  textoClaro: {
    // Cor usada no texto do item sobre o card escuro.
    color: "#F1F7F2",
  },
  textoComprado: {
    textDecorationLine: "line-through",
    color: "#9AAA9E",
  },
  botaoEditar: {
    backgroundColor: "#2F6B4F",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginRight: 8,
  },
  textoBotaoEditar: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  botaoExcluir: {
    backgroundColor: "#7A9E85",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  textoBotaoExcluir: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
});
