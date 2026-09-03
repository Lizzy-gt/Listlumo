import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TarefaItem({
  item,
  aoAlternarComprado,
  aoExcluir,
  aoEditar,
}) {
  return (
    <View style={styles.item}>
      <TouchableOpacity
        style={styles.textoContainer}
        onPress={() => aoAlternarComprado(item.id)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.comprado }}
        accessibilityLabel={item.nome}
      >
        <View
          style={[styles.checkbox, item.comprado && styles.checkboxMarcado]}
        >
          {item.comprado && <Text style={styles.check}>✓</Text>}
        </View>
        <Text style={[styles.texto, item.comprado && styles.textoComprado]}>
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
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    // Sombra leve só para destacar o card (funciona em iOS e Android)
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
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
    borderColor: "#c8cdd3",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxMarcado: {
    backgroundColor: "#2f7d68",
    borderColor: "#2f7d68",
  },
  check: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  texto: {
    fontSize: 16,
    color: "#222",
  },
  textoComprado: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  botaoExcluir: {
    backgroundColor: "#e74c3c",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  botaoEditar: {
    backgroundColor: "#2e86de",
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
  textoBotaoExcluir: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
});
