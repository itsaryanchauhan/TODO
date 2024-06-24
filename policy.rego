package todoapp

default allow = false

allow {
    input.user.role == "admin"
}

allow {
    input.user.role == "guest"
    input.action == "read"
    input.resource == "tasks"
}

allow {
    input.user.role == "guest"
    input.action == "create"
    input.resource == "tasks"
}