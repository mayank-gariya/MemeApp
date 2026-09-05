from flask import Flask , render_template , jsonify , request
import requests

app = Flask(__name__ ,template_folder='templates')

def get_meme(n=20):
    url = f"https://meme-api.com/gimme/{n}"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            return response.json().get('memes', [])
        return []
    except Exception as e:
        print(f"Error fetching memes: {e}")
        return []
    
@app.route('/')
def home():
    return render_template('index.html')


@app.route('/meme')
def meme():
    meme_list = get_meme()
    return render_template('meme.html',memes=meme_list)

@app.route('/api/memes')
def get_more_meme():
    count = request.args.get('count',12,type=int)
    meme_list = get_meme(count)
    return jsonify(meme_list)

if __name__ == '__main__':
    app.run(debug=True)