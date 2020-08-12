<template>
  <div class="container">
    <div class="col-sm-10">
      <h1>Задачи <span class="txt">(выполнены: {{completeTasks}} из {{totalTasks}})</span></h1>

      <confirmation
        :message="confirmationMessage"
        v-if="showConfirmation">
      </confirmation>

      <b-form-checkbox
        id="checkbox-1"
        v-model="showConfStatus"
        value="true"
        @change="statusShowConfClick">
          Показывать сообщения
      </b-form-checkbox>

      <button type="button"
              id="task-add"
              class="btn btn-success btn-sm align-left d-block"
              v-b-modal.todo-modal
              @click="showModal('add')">
        Добавить задачу
      </button>

      <!--<button @click="saveToLocalStore">-->
        <!--Save to local store-->
      <!--</button>-->

      <table class="table table-dark table-stripped table-hover">
        <thead class="thead-light">
          <tr>
            <th>Uid</th>
            <th>Описание</th>
            <th>Выполнена?</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(todo, index) in todos" :key="index">
            <td>{{ todo.uid }}</td>
            <td>{{ todo.description }}</td>
            <td>
              <span v-if="todo.is_completed">Выполнено</span>
              <span v-else>Не выполнено</span>
            </td>
            <td>
              <div class="btn-group" role="group">
                <button type="button"
                        class="btn btn-secondary btn-sm"
                        v-b-modal.todo-modal
                        @click="showModal('upd', todo)">
                  Обновить
                </button>
                &nbsp;
                <button type="button"
                        class="btn btn-danger btn-sm"
                        v-b-modal.todo-modal
                        @click="showModal('del', todo)">
                  X
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <b-modal ref="addTodoModal"
               id="todo-modal"
               :title="modalTitle"
               hide-footer>
        <b-form @submit="onSubmit" @reset="onReset" class="w-100">
        <b-form-group id="form-description-group"
                      label="Описание:"
                      label-for="form-description-input">
          <b-form-input id="form-description-input"
                        type="text"
                        v-model="addTodoForm.description"
                        required
                        :readonly="modalReadOnly"
                        placeholder="Сделать что-то">
          </b-form-input>
        </b-form-group>
        <b-form-group id="form-complete-group">
          <b-form-checkbox-group
            v-model="addTodoForm.is_completed"
            id="form-checks"
            :disabled="modalReadOnly">
            <b-form-checkbox value="true">
              Задача выполнена?
            </b-form-checkbox>
          </b-form-checkbox-group>
          </b-form-group>
          <b-button type="submit" variant="primary">{{getTaskName()}}</b-button>
          <b-button type="reset" variant="danger">Сброс</b-button>
        </b-form>
      </b-modal>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Confirmation from './Confirmation.vue';

const dataURL = 'http://localhost:5000/api/tasks/';

export default {
  name: 'Todo',
  data() {
    return {
      todos: [],

      addTodoForm: {
        uid: 0,
        description: '',
        is_completed: [],
      },

      totalTasks: 0,

      completeTasks: 0,

      confirmationMessage: '',

      modalTitle: '',

      modalReadOnly: false,

      showConfirmation: false,

      showConfStatus: true,

      useLocalStorage: true,

    };
  },

  methods: {
    getTodos() {
      if (this.useLocalStorage) {
        this.todos = JSON.parse(localStorage.getItem('todos'));
      } else {
        axios.get(dataURL)
          .then((response) => {
            this.todos = response.data.tasks;
          });
      }
      if (this.todos) {
        this.totalTasks = this.todos.length;
        this.completeTasks = this.todos.filter((todo) => todo.is_completed).length;
      }
    },

    resetForm() {
      this.addTodoForm.description = '';
      this.addTodoForm.is_completed = [];
    },

    onSubmit(event) {
      event.preventDefault();
      this.$refs.addTodoModal.hide();
      // const option = this.$refs.addTodoModal.title;
      const requestData = {
        description: this.addTodoForm.description,
        is_completed: this.addTodoForm.is_completed.length > 0,
      };
      let todoURL = '';
      let mess = '';
      let todo = null;
      let newUID = 0;

      if (this.showConfStatus) {
        this.showConfirmation = true;
      } else {
        this.showConfirmation = false;
      }

      if (this.modalTitle === 'Добавить задачу') {
        mess = `Задача "${requestData.description}" добавлена`;

        if (this.useLocalStorage) {
          newUID = 1;
          if (this.todos) {
            if (this.todos.length > 0) {
              newUID = Math.max.apply(null,
                Object.values(this.todos.map((x) => Object.values(x)[2]))) + 1;
            }
          }

          todo = {
            description: requestData.description,
            is_completed: requestData.is_completed,
            uid: newUID,
          };

          if (this.todos) {
            this.todos = [...this.todos, todo];
          } else {
            this.todos = [todo];
          }
          localStorage.setItem('todos', JSON.stringify(this.todos));
          this.getTodos();
          this.confirmationMessage = mess;
        } else {
          axios.post(dataURL, requestData)
            .then(() => {
              this.getTodos();
              this.confirmationMessage = mess;
            });
        }
      } else if (this.modalTitle === 'Править задачу') {
        mess = `Задача "${requestData.description}" обновлена`;

        if (this.useLocalStorage) {
          [todo] = this.todos.filter((x) => x.uid === this.addTodoForm.uid);
          if (todo) {
            todo.description = requestData.description;
            todo.is_completed = requestData.is_completed;
          }
          localStorage.setItem('todos', JSON.stringify(this.todos));
          this.getTodos();
          this.confirmationMessage = mess;
        } else {
          todoURL = dataURL + this.addTodoForm.uid;

          axios.put(todoURL, requestData)
            .then(() => {
              this.getTodos();
              this.confirmationMessage = mess;
            });
        }
      } else if (this.modalTitle === 'Удалить задачу') {
        mess = `Задача "${requestData.description}" удалена`;

        if (this.useLocalStorage) {
          let index = -1;
          index = this.todos.map((x) => x.uid).indexOf(this.addTodoForm.uid);
          if (index >= 0) {
            this.todos.splice(index, 1);
            localStorage.setItem('todos', JSON.stringify(this.todos));
            this.getTodos();
            this.confirmationMessage = mess;
          }
        } else {
          todoURL = dataURL + this.addTodoForm.uid;

          axios.delete(todoURL)
            .then(() => {
              this.getTodos();
              this.confirmationMessage = mess;
            });
        }
      }
      this.resetForm();
    },

    onReset(event) {
      event.preventDefault();
      this.$refs.addTodoModal.hide();
      this.resetForm();
    },

    getTaskName() {
      let result = '';
      if (this.modalTitle === 'Добавить задачу') {
        result = 'Добавить';
      } else if (this.modalTitle === 'Править задачу') {
        result = 'Править';
      } else if (this.modalTitle === 'Удалить задачу') {
        result = 'Удалить';
      }
      return result;
    },

    showModal(opt, todo) {
      if (opt === 'add') {
        // this.$refs.addTodoModal.title = 'Добавить задачу';
        this.modalTitle = 'Добавить задачу';
        this.modalReadOnly = false;
      } else if (opt === 'upd' || opt === 'del') {
        this.addTodoForm.uid = todo.uid;
        this.addTodoForm.description = todo.description;
        if (todo.is_completed) {
          this.addTodoForm.is_completed = [true];
        } else {
          this.addTodoForm.is_completed = [];
        }
        if (opt === 'upd') {
          this.modalTitle = 'Править задачу';
          this.modalReadOnly = false;
        } else {
          this.modalTitle = 'Удалить задачу';
          this.modalReadOnly = true;
        }
      }
    },

    statusShowConfClick() {
      if (this.showConfStatus) {
        this.showConfirmation = false;
      }
    },
  },

  created() {
    this.getTodos();
  },

  components: {
    confirmation: Confirmation,
  },
};
</script>

<style>
button#task-add {
  margin-top: 20px;
  margin-bottom: 20px;
}
h1, td {
  text-align: left;
}
.todo-uid {
  text-align: right;
}
.txt {
  font-size: 18pt;
  font-weight: bold;
}
</style>
