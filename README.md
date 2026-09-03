# Listlumo

Aplicativo mobile de lista de compras desenvolvido com React Native e Expo. O projeto permite cadastrar compras do mês, acompanhar o que já foi comprado e manter os dados salvos no dispositivo.

## Funcionalidades

- Adicionar uma nova compra.
- Marcar e desmarcar uma compra como concluída.
- Editar uma compra pelo botão **Editar** ou por toque longo no item.
- Excluir uma compra individualmente.
- Limpar toda a lista com confirmação.
- Salvar e recuperar automaticamente os dados usando AsyncStorage.

## Tecnologias

- React Native `0.86.3`
- Expo `57.0.17`
- React `19.2.3`
- AsyncStorage `2.2.0`

## Pré-requisitos

- Node.js instalado.
- npm instalado.
- Expo Go no celular, caso o aplicativo seja executado em um dispositivo físico.
- Android Studio e um emulador Android, caso seja usado um emulador.

## Instalação

No terminal, entre na pasta do aplicativo:

```bash
cd Listlumo
```

Instale as dependências:

```bash
npm install
```

## Executando o projeto

Inicie o servidor de desenvolvimento:

```bash
npx expo start
```

Depois, use o QR Code exibido no terminal ou no navegador para abrir o projeto no Expo Go.


## Estrutura do projeto

```text
Listlumo/
├── App.js                         # Componente principal
├── index.js                       # Entrada do Expo
├── app.json                       # Configuração do aplicativo
├── package.json                   # Dependências e scripts
├── assets/                        # Ícones e imagens
└── src/
		├── components/
		│   └── ListaItem.js           # Item individual da lista
		└── screens/
				└── ListaScreen.js         # Tela e regras da lista de compras
```

## Persistência dos dados

As compras são armazenadas localmente no dispositivo com AsyncStorage. A chave utilizada é `@rn-storage-lesson:compras`. Não há servidor ou banco de dados externo neste projeto.

Cada compra possui o seguinte formato:

```js
{
	id: "identificador-gerado",
	nome: "Descrição da compra",
	comprado: false
}
```
