# api/chat.py
from http.server import BaseHTTPRequestHandler
from zhipuai import ZhipuAI
import json
import os
import traceback
import asyncio

ZHIPUAI_API_KEY = os.environ.get("ZHIPUAI_API_KEY")
if not ZHIPUAI_API_KEY:
    raise ValueError("ZHIPUAI_API_KEY environment variable is not set")

client = ZhipuAI(api_key=ZHIPUAI_API_KEY)
system_prompt = '''你需要扮演一个人，中文名字叫做朱晗，英文名字叫Henry。你需要以朱晗的第一人称视角来回答用户提出的问题。
朱晗的个人信息如下：

年龄：27。
性别：男。
教育背景：本科就读于杭州电子科技大学，通信工程专业；第一个硕士就读于四川大学，人工智能专业；目前第二个硕士就读于香港理工大学，数据科学专业。去香港理工大学读第二个硕士的原因是当时在四川大学的实验室项目偏横向项目，同学都去找后端开发方面的工作，但自己的兴趣还是在AI方面，想从事算法方面的工作。
兴趣爱好：喜欢户外运动比如，徒步，登山；体育运动喜欢踢球，喜欢打羽毛球；其他空闲时间喜欢电影，动漫，音乐，编曲，弹钢琴，弹吉他。
个人情况：单身没有女朋友，有喜欢的女生，但是那个女生不喜欢他。喜欢旅行，喜欢和简单善良的人做朋友。音乐方面喜欢爵士音乐，嘻哈音乐。
未来计划：短期计划是做好大语言模型，AIGC方面的工作和研究，长期计可能会考虑从事STEAM方向，PYP教育方面的工作。'''

class handler(BaseHTTPRequestHandler):
    async def stream_response(self, response):
        for chunk in response:
            if chunk.choices[0].delta.content is not None:
                yield chunk.choices[0].delta.content

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        query = data.get('message')

        if not query:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(json.dumps({"error": "No message provided"}).encode())
            return

        try:
            self.send_response(200)
            self.send_header('Content-type', 'text/event-stream')
            self.send_header('Cache-Control', 'no-cache')
            self.send_header('Connection', 'keep-alive')
            self.end_headers()

            response = client.chat.completions.create(
                model="glm-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query},
                ],
                stream=True
            )

            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            for chunk in loop.run_until_complete(self.stream_response(response)):
                self.wfile.write(f"data: {json.dumps({'content': chunk})}\n\n".encode('utf-8'))
                self.wfile.flush()

            self.wfile.write(b"data: [DONE]\n\n")
            self.wfile.flush()

        except Exception as e:
            error_message = f"An error occurred: {str(e)}\n{traceback.format_exc()}"
            print(error_message)  # 这会记录到 Vercel 的日志中
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": error_message}).encode())