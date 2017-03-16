#!groovy
@Library('pipeline-library') _

timestamps {
	node('git && (osx || linux)') {
		stage('Checkout') {
			checkout scm
		}

		stage('Configuration') {
			sh "echo \"module.exports = { logLevel: 'error', connectors: { 'appc.odata': { url: 'http://localhost' }}}\" > conf/local.js"
		}

		buildConnector {
			// don't override anything yet
		}
	}
}
