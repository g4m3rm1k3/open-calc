import devEnvironment from './ae0-01-dev-environment.js'
import git from './ae0-02-git.js'
import gpuSetup from './ae0-03-gpu-setup.js'
import apisKeys from './ae0-04-apis-keys.js'
import jupyter from './ae0-05-jupyter.js'
import pythonEnvironments from './ae0-06-python-environments.js'
import docker from './ae0-07-docker.js'
import editorSetup from './ae0-08-editor-setup.js'
import dataManagement from './ae0-09-data-management.js'
import terminal from './ae0-10-terminal.js'
import linux from './ae0-11-linux.js'
import debugging from './ae0-12-debugging.js'

export default [
  {
    number: 'ae-p0',
    title: 'Setup & Tooling',
    course: 'ai-engineering',
    lessons: [devEnvironment, git, gpuSetup, apisKeys, jupyter, pythonEnvironments, docker, editorSetup, dataManagement, terminal, linux, debugging],
  },
]
