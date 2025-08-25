import { Post, Subscriber } from '@/types'

interface EmailData {
  to: string
  subject: string
  text: string
  html: string
}

class EmailService {
  private mockDelay = 1000

  async sendEmail(data: EmailData): Promise<boolean> {
    console.log('📧 Sending email:', {
      to: data.to,
      subject: data.subject,
      preview: data.text.slice(0, 100) + '...'
    })

    await new Promise(resolve => setTimeout(resolve, this.mockDelay))

    const success = Math.random() > 0.05
    
    if (success) {
      console.log('Email sent successfully to:', data.to)
    } else {
      console.log('Email failed to send to:', data.to)
    }

    return success
  }

  async sendNewsletterEmail(post: Post, subscribers: Subscriber[]): Promise<{
    sent: number
    failed: number
    errors: string[]
  }> {
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[]
    }

    console.log(`📬 Sending newsletter "${post.title}" to ${subscribers.length} subscribers...`)

    const subject = `New Post: ${post.title}`
    const text = this.generateTextEmail(post)
    const html = this.generateHtmlEmail(post)

    for (const subscriber of subscribers) {
      try {
        const success = await this.sendEmail({
          to: subscriber.email,
          subject,
          text,
          html
        })

        if (success) {
          results.sent++
        } else {
          results.failed++
          results.errors.push(`Failed to send to ${subscriber.email}`)
        }
      } catch (error) {
        results.failed++
        results.errors.push(`Error sending to ${subscriber.email}: ${error}`)
      }
    }

    console.log(`Newsletter sent: ${results.sent} successful, ${results.failed} failed`)
    return results
  }

  private generateTextEmail(post: Post): string {
    return `
New Post Published: ${post.title}

${post.content}

---
Read the full post online: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/posts/${post.slug}

Thanks for subscribing to our newsletter!
    `.trim()
  }

  private generateHtmlEmail(post: Post): string {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title}</title>
  <style>
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px;
    }
    .header { 
      background: linear-gradient(135deg, #92400e, #a16207); 
      color: white; 
      padding: 30px; 
      text-align: center; 
      border-radius: 8px 8px 0 0; 
    }
    .content { 
      background: white; 
      padding: 30px; 
      border-radius: 0 0 8px 8px; 
      box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
    }
    .button { 
      display: inline-block; 
      background: #92400e; 
      color: white; 
      padding: 12px 24px; 
      text-decoration: none; 
      border-radius: 6px; 
      margin: 20px 0; 
    }
    .footer { 
      text-align: center; 
      margin-top: 30px; 
      padding: 20px; 
      background: #f9f9f9; 
      border-radius: 6px; 
      font-size: 14px; 
      color: #666; 
    }
    p { margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📧 Personal Newsletter</h1>
    <p>New post published!</p>
  </div>
  
  <div class="content">
    <h2>${post.title}</h2>
    <div style="margin: 20px 0; padding: 20px; background: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
      ${post.content.split('\n').map(para => para.trim() ? `<p>${para}</p>` : '').join('')}
    </div>
    
    <div style="text-align: center;">
      <a href="${appUrl}/posts/${post.slug}" class="button">Read Full Post →</a>
    </div>
  </div>
  
  <div class="footer">
    <p>Thanks for subscribing to our newsletter!</p>
    <p><a href="${appUrl}">Visit our website</a></p>
  </div>
</body>
</html>
    `.trim()
  }
}

const emailService = new EmailService()

export async function sendNewsletterForPost(post: Post) {
  try {
    const { prisma } = await import('./db')
    
    const subscribers = await prisma.subscriber.findMany({
      where: { isActive: true }
    })

    if (subscribers.length === 0) {
      console.log('No subscribers found, skipping newsletter send')
      return { sent: 0, failed: 0, errors: [] }
    }

    const results = await emailService.sendNewsletterEmail(post, subscribers)
    
    return results
  } catch (error) {
    console.error('Error sending newsletter:', error)
    throw error
  }
}