const { parseMultipartData, sanitizeEntity, env } = require('strapi-utils')
const axios = require('axios');
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  /**
   * Create a record.
   *
   * @return {Object}
   */

   async create(ctx) {
    const requestBody = ctx.request.body

    const captchaSecret = env('CAPTCHA_SECRET', null)
    const discordWebhook = env('DISCORD_WEBHOOK', null)
    
    try {
      const { data } = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${captchaSecret}&response=${requestBody.captcha}`)
      if(data.success){
        requestBody.captcha = data.score
        if(discordWebhook){
          await axios.post(discordWebhook, {content:`Name: ${requestBody.name}\nEmail: ${requestBody.email}\nMessage: ${requestBody.message}`})
        }
      } else {
        delete requestBody.captcha
      }
    } catch (error) {
      console.log(error)
    }

    const createdRequest = await strapi.services['contact-request'].create(requestBody);

    return sanitizeEntity(createdRequest, { model: strapi.models['contact-request'] });
  },
};