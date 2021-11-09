const moduleGrocery= {
	namespaced: true,
	state: () => ({
		list: null,
		baseURL: 'https://firestore.googleapis.com/v1/projects/grocery-3e45f/databases/(default)',
		apiKey: 'AIzaSyCO8iffr2N91WyQME3IKXIE4kaPtmrTUe0',
		isAdding: false,
		isEditing: "" 
	}),
	mutations: {
		GET_LIST(state, payload) {
            state.list = payload;
        },
		IS_ADDING(state, payload) {
			state.isAdding = payload;
		},
		IS_EDITING(state, payload) {
			state.isEditing = payload;
		}
	},
	actions: {
		getList(context) {
			let payload;
			axios.get(`${context.state.baseURL}/documents/groceries?&key=${context.state.apiKey}`)
			  .then(function (response) {
				payload = response.data.documents;
				context.commit('GET_LIST', payload);
			  })
			  .catch(function (error) {
				payload = error;
			});
		},
		addItem(context, payload) {
			let body = {
				fields: {
					item: {
						stringValue: payload
					}
				}
			}
			axios.post(`${context.state.baseURL}/documents/groceries?&key=${context.state.apiKey}`, body)
				.then(function (response) {
					context.dispatch('getList');
					context.dispatch('setIsAdding', false);
				})
				.catch(function (error) {
					console.log(error);
				})
		},
		deleteItem(context, payload) {
			axios.delete(`${context.state.baseURL}/documents/groceries/${payload}?&key=${context.state.apiKey}`)
				.then(function (response) {
					context.dispatch('getList');
				})
				.catch(function (error) {
					console.log(error);
				})
		},
		editItem(context, payload) {
			let body = {
				fields: {
					item: {
						stringValue: payload.item
					}
				}
			}
			axios.patch(`${context.state.baseURL}/documents/groceries/${payload.name}?&key=${context.state.apiKey}`, body)
				.then(function (response) {
					context.dispatch('getList');
					context.dispatch('setIsEditing', "");
				})
				.catch(function (error) {
					console.log(error);
				})
		},
		setIsAdding(context, payload) {
			context.commit('IS_ADDING', payload);
		},
		setIsEditing(context, payload) {
			context.commit('IS_EDITING', payload);
		}
	},
	getters: {
		getList: state => { return state.list },
		getIsAdding: state => { return state.isAdding},
		getIsEditing: state => { return state.isEditing },
	}
}

const store = Vuex.createStore({
	modules: {
		moduleGrocery
	}
})
const app = Vue.createApp({
	el: "#app",
	beforeMount() {
		this.$store.dispatch("moduleGrocery/getList");
	},
	computed: {
		list() {
			return this.$store.getters["moduleGrocery/getList"];
		},
		isAdding() {
			return this.$store.getters["moduleGrocery/getIsAdding"];
		},
		isEditing() {
			return this.$store.getters["moduleGrocery/getIsEditing"];
		},
	},
	methods: {
		
	},
	components: {

	}
});
app.component('list', {
	template: `
        <div class="list">
            <slot></slot> 
        </div>
	`,
	computed: {
        
	},
	methods: {
		
	}
});
app.component('item', {
	template: `
        <div class="container-item">
            <div class="container-items" v-if="isEditing != itemName">
                <div class="item">{{itemValue}}</div>
                <div class="btn-group-item">
                    <button class="btn" @click="setIsEditing">Edit</button>
                    <button class="btn" @click="deleteItem()">Delete</button>
                </div>
            </div>
            <div class="edit-mode input" v-if="isEditing == itemName">
                <input v-model="inputEditItem">
                <div class="btn-group-edit">
                    <button class="btn" @click="editItem">Submit</button>
                    <button class="btn" @click="cancelIsEditing">Cancel</button>
                </div>
            </div>
        </div>
	`,
	props: ['is-editing', 'item'],
    data() {
        return {
            inputEditItem: ""
        }
    },
	computed: {
        itemValue() {
           return this.item.fields.item.stringValue;
        },
        itemName() {
            let nameArray = this.item.name.split('/');
            return nameArray[(nameArray.length-1)];
        }
	},
	methods: {
        deleteItem() {
            this.$store.dispatch('moduleGrocery/deleteItem', this.itemName);
        },
        setIsEditing() {
            if (this.isEditing == "") {
                this.$store.dispatch('moduleGrocery/setIsEditing', this.itemName);
            }
        },
        cancelIsEditing() {
            this.$store.dispatch('moduleGrocery/setIsEditing', "");
        },
        editItem() {
            let payload = {
                name: this.itemName,
                item: this.inputEditItem
            }
            this.$store.dispatch('moduleGrocery/editItem', payload);
        }
	}
});
app.component('add', {
	template: `
        <div class="container-add">
            <button id="btn-add" class="btn" @click="setIsAdding(true)" v-if="!isAdding">Add</button>
            <div class="container-add-ui input" v-if="isAdding">
                <input v-model="inputAddItem">
                <div class="btn-group-add">
                    <button class="btn" @click="submit">Submit</button>
                    <button class="btn" @click="setIsAdding(false)">Cancel</button>
                </div>
            </div>
        </div>
	`,
    props: ['is-adding'],
    data() {
        return {
            inputAddItem: ""
        }
    },
	computed: {
      
	},
	methods: {
        setIsAdding(value) {
            this.$store.dispatch('moduleGrocery/setIsAdding', value);
        },
        submit() {
            if (this.inputAddItem != "") {
                this.$store.dispatch('moduleGrocery/addItem', this.inputAddItem); 
            }
        },
	}
});
app.use(store);
app.mount('#app');