<template>
  <div>
    <!-- Back Button -->
    <v-btn icon @click="$router.go(-1)" class="back-button">
      <v-icon>mdi-chevron-left</v-icon>
    </v-btn>

    <v-container fluid>
      <v-row>
        <v-col cols="12" sm="4">
          <v-card class="pa-1" height="100%">
            <v-card-item>
              <v-card-title class="text-color mb-5 text-wrap">{{ $t('ticket_number') }}: {{ ticket.code }}
              </v-card-title>
              <v-card-text>
                <strong class="text-color">{{ $t('title') }}: </strong>
                <strong class="font-weight-regular"> {{ ticket.title }}</strong>
                <br><br>
                <strong class="text-color">{{ $t('created') }}: </strong>
                <strong class="font-weight-regular"> {{ ticket.created_at }}</strong>
                <br>
                <br>
                <strong class="text-color">{{ $t('type') }}: </strong>
                <strong class="font-weight-regular">{{ ticket?.type?.label }}</strong>
                <br>
                <br>
                <strong class="text-color">{{ $t('priority') }}: </strong>
                <strong :class="priorityClass" class="text-color">{{ displayPriority(ticket.priority_index) }}</strong>
                <br>
                <br>
                <strong class="text-color">{{ $t('status') }}: </strong>
                <strong :class="statusClass" class="text-color">{{ displayStatus(ticket.status_label) }}</strong>
              </v-card-text>
            </v-card-item>
          </v-card>
        </v-col>
        <!-- Panel Description -->
        <v-col cols="12" sm="4">
          <v-card class="pa-1 scrollable" height="470px">
            <v-card-item>
              <v-card-title class="text-color mb-5">{{ $t('description') }}</v-card-title>
              <v-card-text>
                <strong class="font-weight-regular" v-html="ticket.description"></strong>
                <br>
              </v-card-text>
            </v-card-item>
          </v-card>
        </v-col>
        <!-- Panel Add Comments -->
        <v-col id="panelAddComments" cols="12" sm="4" v-if="!isTicketFinished">
          <v-card class="pa-1" height="100%">
            <v-card-item>
              <v-card-title class="text-color mb-5">{{ $t('add_comments') }}</v-card-title>
            </v-card-item>
            <v-card-text>
              <div>
                <label for="title">{{ $t('title') }}</label>
                <v-text-field id="title" v-model="title" :required="true" @input="checkFormValidity"></v-text-field>
              </div>
              <div>
                <label for="description">{{ $t('description') }}</label>
              </div>
              <div>
                <v-textarea id="description" v-model="description" rows="3" auto-grow="false" :required="true"
                            @input="checkFormValidity"></v-textarea>
              </div>
              <div id="attachmentsFileInput">
                <v-file-input
                    v-model="attachment"
                    multiple
                    v-bind:label="$t('attach_files')"
                    prepend-icon="mdi-paperclip"
                ></v-file-input>
              </div>
              <div class="text-right">
                <v-btn :color="`${primary_color}`" :class="`${colorCalculation(primary_color)}`" @click="send"
                       :disabled="!isFormValid">{{ $t('send') }}
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" v-else>
          <v-card class="pa-1" height="100%">
            <v-card-item>
              <v-card-title class="text-color mb-5">{{ $t('add_comments') }}</v-card-title>
            </v-card-item>
            <v-card-text>
              <div class="finished-message">
                <v-icon class="finished-icon">mdi-check-circle-outline</v-icon>
                <p class="finished-text">{{ $t('This ticket is already finished') }}</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <!-- ALERTS -->
      <v-alert
          v-model="showSuccessAlert"
          type="success"
          title="Success!"
          text="Comment added successfully!"
          class="my-10"
      ></v-alert>
      <v-alert
          v-model="showUploadErrorAlert"
          type="warning"
          title="Opps!"
          text="It seems like you don't have permission to upload files!"
          class="my-10"
      ></v-alert>
      <v-alert
          v-model="showFormErrorAlert"
          type="error"
          title="Ooops!"
          text="Plese check the form again and make sure it is completed!"
          class="my-10"
      ></v-alert>
      <!-- ALERTS -->
      <v-row>

        <!-- Panel Information -->
        <v-col cols="12" sm="8">
          <v-card class="pa-1" height="100%">
            <v-card-item>
              <v-card-title class="text-color mb-5">{{ $t('Comments') }}</v-card-title>
              <v-card-text>
                <div v-for="note in ticket.notes" :key="note.id">
                  <h3>{{ note.title }}</h3>
                  <h4>{{ note.created_at }}</h4>
                  <p v-html="note.body"></p>
                  <br>
                </div>
                <v-card v-for="event in ticket.events" :key="event.id" class="my-3 pa-5">
                  <v-card-title>{{ event.title }}</v-card-title>
                  <v-card-subtitle>{{ formatDate(event.created_at) }}, <i>by: {{ returnSender(event) }}, </i>
                  </v-card-subtitle>
                  <v-card-text>
                    <p v-html="event.body"></p>
                  </v-card-text>
                </v-card>
              </v-card-text>
            </v-card-item>
          </v-card>
        </v-col>
        <!-- Panel Attachments -->
        <v-col id="panelAttachments" cols="12" sm="4">
          <v-card class="pa-2" height="100%">
            <v-card-item>
              <v-card-title class="text-color mb-5">{{ $t('attachments') }}</v-card-title>
              <v-card-text class="d-flex flex-column">
                <v-card v-for="attachment in ticket.attachments" :key="attachment.name" class="my-3 pa-5">
                  <img :src="attachment.url" v-if="isImage(attachment.content_type)" class="w-100"/>
                  <v-icon size="x-large" class="mx-auto" v-if="!isImage(attachment.content_type)">mdi-file</v-icon>
                  <v-card-text>
                    <br>
                    <b>Filename: </b>{{ attachment.display_name }}
                    <br>
                    <b>Date & Time: </b>{{ formatDate(attachment.datetime) }}
                  </v-card-text>
                  <v-card-actions>
                    <v-btn color="#080464" class="white-text" @click="openImage(attachment)">{{ $t('open') }}</v-btn>
                    <v-btn color="#080464" class="white-text" @click="downloadFile(attachment)">{{ $t('download') }}
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-card-text>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>

    </v-container>
  </div>
</template>

<script>
import axios from 'axios';
import {useActiveRelationStore} from "@/stores/activeRelationStore";
import {computed, onMounted, ref} from "vue";
import {useTenantStore} from "@/stores/tenantStore";
import {useUserStore} from "@/stores/userStore";
import moment from 'moment';
import {getAttachments, getComments, getTicketById, postAttachment, postComment} from "@/cube-api-calls";
import {calculateTextColor} from "@/text-color";
import {useFavicon} from "@vueuse/core";

export default {
  setup() {
    const activeRelationStore = useActiveRelationStore();
    const activeRelationStoreRef = ref(activeRelationStore);
    const tenantStore = useTenantStore();
    const activeRelation = computed(() => activeRelationStoreRef.value.getActiveRelation);
    const relationId = computed(() => activeRelation.value.id);
    const relationName = computed(() => activeRelation.value.name);

    //tenantDesign
    const accent_color = tenantStore.tenant.settings.accent_color;
    const primary_color = tenantStore.tenant.settings.primary_color;
    const favicon = tenantStore.tenant.settings.favicon;

    onMounted(() => useFavicon(computed(() => tenantStore.tenant.settings.favicon).value));

    return {
      relationId,
      relationName,
      accent_color,
      primary_color,
      favicon
    }
  },

  data() {
    return {
      title: '',
      description: '',
      isFormValid: false,
      attachment: null,
      //snackbar may be deleted later
      showSnackbar: false,
      alertTimeout: 700,
      showSuccessAlert: false,
      showFormErrorAlert: false,
      showUploadErrorAlert: false,
      ticket: {},
    };
  },

  async created() {
    this.fetchTicketData();
  },

  methods: {
    async fetchTicketData() {
      try {
        const response = await getTicketById(this.relationId, this.getTicketId, this.getToken)
        this.ticket = response.data;

        await this.fetchAttachments();
        await this.fetchComments();
      } catch (error) {
        console.error('Error fetching ticket data:', error);
      }
    },
    async fetchAttachments() {
      try {
        const response = await getAttachments(this.relationId, this.getTicketId, this.getToken)
        this.ticket.attachments = response.data;
      } catch (error) {
        console.error('Error fetching attachments:', error);
      }
    },
    async fetchComments() {
      try {
        const commentsResponse = await getComments(this.relationId, this.getTicketId, this.getToken)
        this.ticket.events = commentsResponse.data;
        console.log(this.ticket.events)
      } catch (error) {
        console.error('Error fetching ticket data:', error);
      }
    },
    async postComment() {
      try {
        const data = {
          title: this.title,
          body: this.description
        }

        const response = await postComment(this.relationId, this.getTicketId, data, this.getToken);

        if (response.status === 200) {
          this.ticket.events.unshift(response.data);
        }
      } catch (error) {
        console.error('Error posting comment:', error);
      }
    },
    async uploadAttachment() {
      if (!this.attachment) return;
      try {
        const formData = new FormData();
        for (let i = 0; i < this.attachment.length; i++) {
          formData.append('attachment', this.attachment[i]);
        }
        await postAttachment(this.relationId, this.getTicketId, formData, this.getToken)

      } catch (error) {
        console.error('Error uploading attachment:', error);
        //show an alert
        this.showUploadErrorAlert = true;
        setTimeout(() => {
          this.showUploadErrorAlert = false;
        }, 3000);
      }
    },
    async send() {
      this.showFormErrorAlert = false;
      if (this.isFormValid) {
        this.showSuccessAlert = true;
        await this.postComment();
        await this.uploadAttachment();
        setTimeout(() => {
          this.showSuccessAlert = false;
          this.clearFields();
          window.location.reload();
        }, 2000);
      } else {
        this.showFormErrorAlert = true;
        setTimeout(() => {
          this.showFormErrorAlert = false;
        }, 2000);
      }
    },
    async downloadFile(attachment) {
      try {
        const response = await axios({
          url: attachment.url,
          method: 'GET',
          responseType: 'blob', // important
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', attachment.name);
        document.body.appendChild(link);
        link.click();
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    },
    returnSender(event){
      if(event.attributes.length===0){
        return "unknown"
      }
      else return event.attributes[0].value
    },
    formatDate(date) {
      return moment(date).format('DD/MM/YYYY HH:mm');
    },
    isImage(contentType) {
      return contentType.startsWith('image/');
    },
    openImage(attachment) {
      window.open(attachment.url, '_blank');
    },
    checkFormValidity() {
      this.isFormValid = this.title && this.description;
    },
    clearFields() {
      this.title = '';
      this.description = '';
      this.attachment = null;
      this.isFormValid = false;
    },
    displayPriority(priorityIndex) {
      const priorityMap = {
        0: 'Low',
        1: 'Medium',
        10: 'High',
        34: 'TBD'
      };
      return priorityMap[priorityIndex] || priorityIndex;
    },
    displayStatus(statusName) {
      const statusMap = {
        finished: 'Finished',
        todo: 'To-Do',
        in_progress: 'In-Progress'
      };
      return statusMap[statusName] || statusName;
    },
    colorCalculation(theColor) {
      return calculateTextColor(theColor);
    }
  },
  computed: {
    priorityClass() {
      const ticket = this.ticket;
      const priorityMap = {
        0: 'low-priority',
        1: 'medium-priority',
        10: 'high-priority',
        34: 'tbd-priority'
      };
      return priorityMap[ticket.priority_index] || '';
    },

    statusClass() {
      const ticket = this.ticket;
      const statusMap = {
        finished: 'finished-status',
        todo: 'todo-status',
        in_progress: 'in-progress-status'
      };
      return statusMap[ticket.status_label] || '';
    },

    isTicketFinished() {
      return this.ticket.status === 'finished';
    },

    getToken() {
      const userStore = useUserStore()
      return userStore.getToken
    },

    getTicketId() {
      return this.$route.params.id
    }

  },
};
</script>

<style scoped>
/* Add your custom styles here */

.back-button {
  position: absolute;
  top: 75px;
  left: 25px;
  z-index: 10;
}

.text-color {
  color: #212121;
}

.low-priority {
  background-color: green;
  color: #ffffff;
  padding: 5px 10px;
  border-radius: 4px;
}

.medium-priority {
  background-color: #ffa726;
  color: #ffffff;
  padding: 5px 10px;
  border-radius: 4px;
}

.high-priority {
  background-color: red;
  color: #ffffff;
  padding: 5px 10px;
  border-radius: 4px;
}

.tbd-priority {
  background-color: #b7b7b7;
  color: #ffffff;
  padding: 5px 10px;
  border-radius: 4px;
}

.finished-status {
  background-color: rgb(31, 187, 31);
  color: #ffffff;
  padding: 5px 10px;
  border-radius: 4px;
}

.todo-status {
  background-color: #2196f3;
  color: #ffffff;
  padding: 5px 10px;
  border-radius: 4px;
}

.in-progress-status {
  background-color: #ffc400;;
  color: #ffffff;
  padding: 5px 10px;
  border-radius: 4px;
}

.custom-snackbar {
  background-color: #43a047;
  color: #ffffff;
}

.finished-message {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;
}

.finished-icon {
  font-size: 64px;
  color: rgb(31, 187, 31);
  margin-bottom: 16px;
}

.finished-text {
  font-size: 18px;
  font-weight: bold;
  color: rgb(31, 187, 31);
  text-align: center;
}

.white-text {
  color: white;
}

.scrollable {
  flex-flow: column;
  overflow-y: scroll;
}

</style>
