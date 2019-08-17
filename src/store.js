import types from './data/types'

import axios from 'axios';

function getTypeAsBooleanFields(type) {
  const fields = {
    is_private: false,
    is_command: false,
    is_organizational: false
  }

  switch(type) {
    case 'private':
      fields.is_private = true;
    break;

    case 'command':
      fields.is_command = true;
    break;

    case 'organization':
      fields.is_organizational = true;
    break;
  }

  return fields;
}

let host = window.location.host;
let target = host.slice(0, host.indexOf("."));

if(target === 'test1' || target === '192') {
  target = 'univer';
}

export default {
  state: {
    driveURL: `https://${target}.isirius.kz/drive`,
    types: [],
    archivedBoards: [],
    departmentsTree: null,
    today: null
  },
  mutations: {
    createBoard(state, { board, type }) {
      const currentType = state.types.find(e => e.name === type);

      currentType.children.unshift(board);
    },
    setTypes(state, types) {
      state.types = types;
    },
    updateBoard(state, { id, board, type }) {
      const currentType = state.types.find(e => e.name === type);
      const index = currentType.children.findIndex(e => e.id === id);

      currentType.children[index] = board;
    },
    archiveBoard(state, { id, type }) {
      const currentType = state.types.find(e => e.name === type);
      const index = currentType.children.findIndex(e => e.id === id);

      currentType.children.splice(index, 1);
    },
    setArchivedBoards(state, archivedBoards) {
      state.archivedBoards = archivedBoards;
    },
    restoreBoard(state, { board, type }) {
      const currentType = state.types.find(e => e.name === type);

      currentType.children.push(board);

      const archivedIndex = state.archivedBoards.findIndex(e => (
        e.id === board.id
      ));

      state.archivedBoards.splice(archivedIndex, 1);
    },
    setDepartmentsTree(state, tree) {
      state.departmentsTree = tree;
    },
    setLists(state, lists) {
      state.lists = lists;
    },
    setToday(state, today) {
      state.today = today;
    }
  },
  actions: {
    async createBoard({ commit }, { model, type }) {
      const typeAsBooleanFields = getTypeAsBooleanFields(type),
            form = Object.assign(model, typeAsBooleanFields);

      try {
        const response = await axios.post('tm/boards/', form);

        commit('createBoard', { board: response.data, type });
      }
      catch(error) {
        return error;
      }
    },
    async readBoards({ commit }) {
      try {
        const response = await axios.get('tm/boards/');
        const boards = response.data;

        for (let i = 0; i < types.length; i++) {
          const item = types[i];
          const board = boards[item.id];
  
          item.children = board.boards;

          if(!board.can_create) item.actions.splice(0, 1);
        }

        commit("setTypes", types);

        const today = (await axios.get('/app_settings/appsettings/get_now/')).data;

        commit('setToday', today);
      }
      catch(error) {
        return error.response;
      }
    },
    async updateBoard({ commit }, { id, model, type }) {
      const typeAsBooleanFields = getTypeAsBooleanFields(type),
            form = Object.assign(model, typeAsBooleanFields);

      try {
        const response = await axios.patch(`tm/boards/${id}/`, form);

        commit('updateBoard', { id: id, board: response.data, type });
      }
      catch(error) {
        return error;
      }
    },
    async archiveBoard({ commit }, { id, type }) {
      try {
        await axios.post(`tm/boards/${id}/archive/`);

        commit('archiveBoard', { id, type });
      }
      catch(error) {
        return error;
      }
    },
    async readArchivedBoards({ commit }, { type }) {
      try {
        const archivedBoards = (await axios.get(
          `tm/boards/archived/?type=${type}`
        )).data;

        commit("setArchivedBoards", archivedBoards);
      }
      catch(error) {
        return error.response;
      }
    },
    async restoreBoard({ commit }, { board, type }) {
      try {
        await axios.post(`tm/boards/${board.id}/restore/`);

        commit('restoreBoard', { board, type });
      }
      catch(error) {
        return error;
      }
    },
    async readDepartmentsTree({ commit }) {
      try {
        const tree = (await axios.get('/structures/department-tree/')).data;

        commit('setDepartmentsTree', tree);
      }
      catch(error) {
        return error;
      }
    },
  }
}
