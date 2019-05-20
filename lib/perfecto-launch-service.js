import fs from 'fs'
import _ from 'lodash'
import glob from 'glob'

const { TagExpressionParser } = require('cucumber-tag-expressions')
const tagParser = new TagExpressionParser()
/**
 *
 * Returns the paths to the feature files that match the given tags.
 *
 * See https://github.com/cucumber/cucumber/wiki/Tags for tag syntax
 *
 * @example Paths for features that have @site-mlc
 * var taggedFeatures = require('./taggedFeatures');
 * var paths = taggedFeatures.paths(['@site-mlc'], 'features');
 *
 * @example Paths for features that have @site-mlc AND @fast
 * var taggedFeatures = require('./taggedFeatures');
 * var paths = taggedFeatures.paths(['@site-mlc','@fast'], 'features');
 *
 *
 * @example Paths for features that have @site-mlc OR @fast
 * var taggedFeatures = require('./taggedFeatures');
 * var paths = taggedFeatures.paths(['@site-mlc,@fast'], 'features');
 *
 * @param tags Array of tags
 * @param featureFileBase Folder path to features.
 * @returns {Array} Array of paths to tagged feature files
 */

function featureFilesWithTags (featuresPath, cucumberTags) {
    // Incoming tags will be a JSON array, need to parse it to tagexpression
    let tagExpression = ''
    for (let i = 0; i < cucumberTags.length; i++) {
        let unitExpression = cucumberTags[i].replace(/,/g, ' or ').replace(/~/g, 'not ')
        if (i > 0) {
            tagExpression = tagExpression + ' and (' + unitExpression + ')'
        } else {
            tagExpression = tagExpression + '(' + unitExpression + ')'
        }
    }
    console.log('tagExpression' + tagExpression)
    // cucumberTags.forEach( tagExpression = "and" + tagExpression );

    const expressionNode = tagParser.parse(tagExpression)
    console.log('FEATURE PATH' + featuresPath)
    const featureFilesHaveTags = glob.sync(featuresPath).filter((featureFile) => {
        const content = fs.readFileSync(featureFile, 'utf8')
        if (content.length > 0) {
            const tagsInFile = content.match(/(@[A-Za-z0-9_-]+)/g) || []
            if (expressionNode.evaluate(tagsInFile)) {
                return true
            }
        }
        return false
    })
    return featureFilesHaveTags
}

// const driver = wd.promiseChainRemote(server);
function getTaggedFeatureSpecs (specPath, tags) {
    if (_.isUndefined(tags)) {
        console.log('cukeTags is not defined. ')
        return {}
    } else {
        let specs = featureFilesWithTags(specPath, tags)
        console.log('found ' + specs.length + ' common features..')
        console.log('Including:', specs, tags)
        return specs
    }
}

class PerfectoLaunchService {
    /**
     * modify config
     */
    onPrepare (config, capabilities) {
        // if (!config.perfectoConnect) {
        //     return
        // }

        console.log('PerfectoLaunchService  onPrepare ' + config.toString())

        this.perfectoConnectOpts = Object.assign({
            securityToken: config.securityToken
        }, config.perfectoConnectOpts)

        const cucumberSpecs = getTaggedFeatureSpecs(config.specs, config.cucumberOpts.tags)
        config.specs = cucumberSpecs

        config.protocol = 'http'
        config.path = '/nexperience/perfectomobile/wd/hub'
        // config.host = 'localhost'
        config.port = this.perfectoConnectOpts.port || 80

        // config.implicitTimeout = config.implicitTimeout || 500

        if (Array.isArray(capabilities)) {
            capabilities.forEach((capability) => {
                capability.securityToken = capability.securityToken || this.perfectoConnectOpts.securityToken
            })
        } else {
            Object.keys(capabilities).forEach((browser) => {
                capabilities[browser].desiredCapabilities.securityToken = capabilities[browser].desiredCapabilities.securityToken || this.perfectoConnectOpts.securityToken
            })
        }
    }
}

module.exports = PerfectoLaunchService
