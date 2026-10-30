const adminConfig = window.SUPABASE_CONFIG;
const adminLoginPanel = document.querySelector("#admin-login-panel");
const adminFeedbackPanel = document.querySelector("#admin-feedback-panel");
const adminLoginForm = document.querySelector("#admin-login-form");
const adminLoginStatus = document.querySelector("#admin-login-status");
const adminFeedbackStatus = document.querySelector("#admin-feedback-status");
const adminFeedbackList = document.querySelector("#admin-feedback-list");
const adminLogout = document.querySelector("#admin-logout");
let adminClient;

function setAdminStatus(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle("is-error", isError);
}

function createAdminClient() {
  if (!adminConfig?.url || !adminConfig?.publicKey) {
    setAdminStatus(adminLoginStatus, "Configure as credenciais públicas do Supabase em supabase-config.js.", true);
    adminLoginForm.querySelector("button").disabled = true;
    return false;
  }

  if (!window.supabase?.createClient) {
    setAdminStatus(adminLoginStatus, "Não foi possível carregar o serviço do Supabase. Verifique sua conexão.", true);
    adminLoginForm.querySelector("button").disabled = true;
    return false;
  }

  adminClient = window.supabase.createClient(adminConfig.url, adminConfig.publicKey);
  return true;
}

function createFeedbackCard(feedback) {
  const card = document.createElement("article");
  card.className = "admin-feedback-card";

  const date = document.createElement("p");
  date.className = "admin-feedback-date";
  date.textContent = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(feedback.created_at));

  const label = document.createElement("label");
  label.htmlFor = `feedback-${feedback.id}`;
  label.textContent = "Comentário (edite para remover informações identificáveis)";

  const message = document.createElement("textarea");
  message.id = `feedback-${feedback.id}`;
  message.value = feedback.message;
  message.maxLength = 1000;
  message.minLength = 10;
  message.rows = 5;
  message.required = true;

  const actions = document.createElement("div");
  actions.className = "admin-feedback-actions";

  const approve = document.createElement("button");
  approve.className = "button button-primary";
  approve.type = "button";
  approve.textContent = "Aprovar e publicar";
  approve.addEventListener("click", () => updateFeedback(feedback.id, message.value, "approved", approve, reject));

  const reject = document.createElement("button");
  reject.className = "button button-secondary";
  reject.type = "button";
  reject.textContent = "Rejeitar e excluir";
  reject.addEventListener("click", () => updateFeedback(feedback.id, message.value, "rejected", reject, approve));

  actions.append(approve, reject);
  card.append(date, label, message, actions);
  return card;
}

async function loadPendingFeedback() {
  setAdminStatus(adminFeedbackStatus, "Carregando comentários...");
  adminFeedbackList.replaceChildren();

  const { data, error } = await adminClient
    .from("feedback")
    .select("id, message, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Could not load feedback for moderation:", error);
    setAdminStatus(adminFeedbackStatus, "Não foi possível carregar os comentários. Verifique a conexão e as permissões.", true);
    return;
  }

  if (data.length === 0) {
    setAdminStatus(adminFeedbackStatus, "Não há comentários aguardando revisão.");
    return;
  }

  setAdminStatus(adminFeedbackStatus, `${data.length} comentário(s) aguardando revisão.`);
  data.forEach((feedback) => adminFeedbackList.append(createFeedbackCard(feedback)));
}

async function updateFeedback(id, messageValue, status, actionButton, otherButton) {
  const message = messageValue.trim();

  if (status === "approved" && (message.length < 10 || message.length > 1000)) {
    setAdminStatus(adminFeedbackStatus, "Para publicar, o comentário precisa ter entre 10 e 1000 caracteres.", true);
    return;
  }

  actionButton.disabled = true;
  otherButton.disabled = true;

  if (status === "rejected") {
    const { error } = await adminClient
      .from("feedback")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Could not delete rejected feedback:", error);
      actionButton.disabled = false;
      otherButton.disabled = false;
      setAdminStatus(adminFeedbackStatus, "Não foi possível excluir o comentário. Tente novamente.", true);
      return;
    }

    setAdminStatus(adminFeedbackStatus, "Comentário rejeitado e excluído.");
    await loadPendingFeedback();
    return;
  }

  const update = { status };
  update.message = message;

  const { error } = await adminClient
    .from("feedback")
    .update(update)
    .eq("id", id);

  if (error) {
    console.error("Could not moderate feedback:", error);
    actionButton.disabled = false;
    otherButton.disabled = false;
    setAdminStatus(adminFeedbackStatus, "Não foi possível atualizar o comentário. Tente novamente.", true);
    return;
  }

  setAdminStatus(adminFeedbackStatus, "Comentário aprovado e publicado.");
  await loadPendingFeedback();
}

async function checkModerator(user) {
  const { data, error } = await adminClient
    .from("feedback_moderators")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Could not verify moderator access:", error);
    setAdminStatus(adminLoginStatus, "Não foi possível verificar as permissões. Verifique se o schema do Supabase foi aplicado.", true);
    return false;
  }

  if (!data) {
    const { error: signOutError } = await adminClient.auth.signOut();
    if (signOutError) {
      console.error("Could not sign out an unauthorized moderator:", signOutError);
    }
    setAdminStatus(adminLoginStatus, "Esta conta não tem permissão para moderar comentários.", true);
    return false;
  }

  adminLoginPanel.hidden = true;
  adminFeedbackPanel.hidden = false;
  await loadPendingFeedback();
  return true;
}

async function initializeAdmin() {
  if (!createAdminClient()) return;

  const { data: { session }, error } = await adminClient.auth.getSession();
  if (error) {
    console.error("Could not read Supabase session:", error);
    setAdminStatus(adminLoginStatus, "Não foi possível verificar a sessão. Atualize a página e tente novamente.", true);
    return;
  }

  if (session) await checkModerator(session.user);
}

adminLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!adminClient) return;

  const formData = new FormData(adminLoginForm);
  const email = String(formData.get("email")).trim();
  const password = String(formData.get("password"));
  const { data, error } = await adminClient.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("Moderator sign-in failed:", error);
    setAdminStatus(adminLoginStatus, "Não foi possível entrar. Confira o e-mail, a senha e a conexão.", true);
    return;
  }

  await checkModerator(data.user);
});

adminLogout.addEventListener("click", async () => {
  const { error } = await adminClient.auth.signOut();
  if (error) {
    console.error("Moderator sign-out failed:", error);
    setAdminStatus(adminFeedbackStatus, "Não foi possível encerrar a sessão. Tente novamente.", true);
    return;
  }

  adminFeedbackPanel.hidden = true;
  adminLoginPanel.hidden = false;
  adminLoginForm.reset();
  setAdminStatus(adminLoginStatus, "Sessão encerrada.");
});

initializeAdmin();
