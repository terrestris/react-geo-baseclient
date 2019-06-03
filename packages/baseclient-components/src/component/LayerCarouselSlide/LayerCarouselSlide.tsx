import * as React from 'react';

import OlSourceTileWMS from 'ol/source/TileWMS';
import OlSourceImageWMS from 'ol/source/ImageWMS';
import OlLayerGroup from 'ol/layer/Group';

import { SimpleButton } from '@terrestris/react-geo';

import './LayerCarouselSlide.less';

// default props
export interface DefaultLayerCarouselSlideProps {
  layer: any;
  extent: number[];
  mapSize: number;
  projection: String;
}

export interface LayerCarouselSlideProps extends Partial<DefaultLayerCarouselSlideProps> {
  onClick: (evt: React.MouseEvent) => void;
  onMouseEnter: (evt: React.MouseEvent) => void;
  onMouseLeave: () => void;
}

export interface LayerCarouselSlideState {
  isLoading: boolean;
}

/**
 * Class representing the layer carousel slider component.
 *
 * @class The Slide.
 * @extends React.Component
 */
export class LayerCarouselSlide extends React.Component<LayerCarouselSlideProps, LayerCarouselSlideState> {

  /**
   *Creates an instance of Slide.
   * @param {SlideProps} props
   * @memberof Slide
   */
  constructor(props: LayerCarouselSlideProps) {
    super(props);

    this.state = {
      isLoading: true
    }

    // bindings
    this.onLoad = this.onLoad.bind(this);
  }

    /**
   *
   * @param layer
   */
  getLayerPreview(layer: any) {
    const {
      extent,
      projection
    } = this.props;

    if (!extent) {
      return;
    }

    if (!layer) {
      return;
    }

    // TODO: nicer image
    if (layer instanceof OlLayerGroup) {
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKIAAACiCAIAAABNkIFMAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4wURDS8BEYLnrgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAZGUlEQVR42u1d2VMb2blvqTetrV0CCdRiMcYyNovHniF2Uk6mJo4zU5VKZXnIX5M/KJWH1KRck8SOZzIw2GYxGANjQAtCEhJCe7da6lbrPnw3ffu2BGgYDBjO9+CyBEjnnN/59qV1rVYLQ3TZSY+OAMGMCMGMCMGMCMGMCMGMCMGMCMGMCMGMYEaEYEaEYEaEYEaEYEaEYEaEYEaEYEaEYEYwI0IwI0IwI0IwI0IwI0IwI0IwI0IwI0IwI5gRIZgRIZgRIZgRIZgRIZgRIZgRIZgRIZgRzIgQzIgQzIgQzIgQzIgQzIgQzIi6J6LL32v9l+Cl7r+ETvCHknpI6pkdINHNsprNZq1Wq1artVpNlmWKogwGA03TNE3jOK7X6xHqXQIsy3Kj0ZAkCcMwgiAoioLTO2eYW62WKIr5fH5nZycajWaz2Xq9rtfrGYZhGMZmszEM43A4TCaTyWQym80EQej1es3NPXYbrVZLp6LLirEkSZVKpVgschyHYZjZbLbb7VarlSCI973rY2CWZblUKq2trc3Ozi4vL6dSKY7j9Ho9RVEWi8VsNjMM4/P53G632+32er0Oh4NhGGXROp1OgVCv1zebTXgJ8OM4LssyhmF6vZ6mabPZbLFYjEYjjuOXD2xZliuVSjwej8fj2WwWwzCv18uyLMuyNpsNx/Fzg7nVatXr9Ww2u7a2NjMzs7KyUiqVJEkCqHAcx3GcJEmKoqxWK8MwLpfLZrO53W6DwYDjeLPZlGVZr9fr9XrYBtzoVqsF7wDerVaLJEmHw9HX1zc4OMiyrNPpJEnyMiHdarUajUaxWIzH4y9fvtzc3MQw7Nq1axiG2Ww2o9FoMBje636P4WZJksrlcjKZjMfjuVwOQNL8jk6n29/fx3EclA1JkgRBEAQBnAqrh38VIw6YW/lzkiStVmswGLxz5879+/dv3brldDrf9wU/Y5IkieO4bDa7ubn5+vVreDMUCnEcB6r6Qljaal2rQRpeNptNURRrtdrR+rWjttbpdARBpFIpnudtNpvP5zObzUajEdl0ZwQzQRAMwwQCgWAwWCwWi8WiJEkgjbu8BIeRoraVW1IoFHZ2dlKpVLlcPoMLftYHTRBms9nr9YKsBqHt9XrBbj1PmHU6HU3TXq83HA4Xi0Wz2RyLxXK5XKVS4XleFEUFUfTAjGPvNEVRdrudZVmQ1YoJZrfbKYo6Z0tbr9fbbLZwOGyxWK5du7a7uwueVSKRyOVyHMeJogjiWpZlBWy9Xq9wtiKl1TvpKLRtNlswGPT7/QzDnMEFP2PS6/VWqxXsao1DpXZB39c9O5YR1eERjuMqlUo6nX737l0ymcxms5VKZX9/P5fLlctlQRBarRa4zqCnG42G4jJRFGU0GimKAhv7qplg5xse0XUpb1sqEkWxVCrlcjme58vlcqFQiMVi2Ww2n88D14qiGIvFNjY2Dg4OlC253e7R0dGBgQGGYcAZuzoO1QcQ7FQWpKyJIAiDweB2uwGkZrMJqAuCUK/XKYpKJpNPnjyJRqPqnVAUNTIy8vjx44GBAXjzSoVHzh7akztUGm2qvFRQh9tK07TNZlN8ZeVPbDbb4ODg6OioRiBfhWDnhXaoToB6s9kEE0xtlCm2GMS/Lp/evegG4Pv4UFmWm80mRLA1MCPX6/LALIoiz/PNZlPN7hAAPwPnAdFZwCzLMnhfoihqwkA0TRsMBnTolwFmSZIKhUK5XG40GupEhclkslqtNE0jI+uDhxlyl4VCoVQqqYU2juM2mw0KEBDMlwFmjuOKxWKlUlHDTJKk3W53uVwo73RJYBYEgeM4qBpT7C+KohwOh8PhuHzB6iuqmyGaXa/X1XkLiFojif1hh0c0MEPaClMF9sCbOoPaNkRnBDPUPaFgyCXXzTqdrr28RKkIQ8BfnvBIewYChDY67ssDc7PZFARBXcwFiQ2TyXQG1TCIzkI3Q+4ZavbUITDIJR8b6VQXL7QXEp1ZmvKw2iYE8/+eTq1Wy2azuVyuVqspahjHcavVarfbj4iNQPVMrVbjOA7KE5SKA1mWoZABmjzea7hUkqRarQYOIRQ7WK3WSyCEThnmarW6t7enKdwnCMJutzudzo69BRBR2d/fTyQS6XQ6nU6Xy+VqtSpJksLBFEWZTKb+/v6BgYHh4WGn03nqYRZZlsvlciqVikQi2Wy2XC4bDAaPxzMwMDA4OMgwzI/MrZ1LbdD7glkQhGKxWK1WlUinEhux2+3tjAg9Wuvr6wsLC99//30kEsnlctDCo6SrQewbjUaPx3Pjxo1PPvnkwYMHfX19J2YySIeDmAHwRFHMZDKLi4tzc3MbGxu7u7uCIJAkGQgEpqamHj58ODExodTDnOBYZFmu1+tKWRxN02dT6fe+dHPjv6S+vARBWCwWq9XaXhtULBbn5uaePHmytLQUi8Ugr6WuR/g/W1Gvj8Vi29vb0Wi0UCg8fvyYZdkfKsAhSQrMimEYwzBer5cgiEQi8eTJk6dPn66uru7v7wuCAP7C9vZ2KpWSZdlqtY6NjdE0fQKMoUJS86U2m+0syxpPGWYNF6q5uR0SjuNWVlb+9re/zczMxGIxJQyuLh9T/t9sNiVJSqfTtVpNkiSapj///HO/39+99JZlOZ/Pr66urqyspNPpVqvl9/vD4bDdbn/69Onf//739fV1pRcQ/qRSqWxubi4sLNy8eTMYDLrd7h8KTLPZzOfza2tra2tryWQSw7BAIBAOh8PhsNvtPrMI/yl/DY7j7fVA0EWnYeVms5lOp7/77ruFhYVIJKI22Y7gjGazWSwWV1dXe3p6hoeHocG6y6PnOO7169d/+ctf5ufnM5kMhmFerxdqwufn51dXV8vlsjqrpnB/PB7f2dnhOM7lcv0gmMEm3dnZmZmZmZmZicfjGIaxLFsoFKBt2GKxdNP8rZ4ToaEuHZDTN2TUvKj5kfplrVbb3t5+8+ZNPB6HOv7D1q3ZJyC9sbGxvb0dDoetVms3R99oNDY2Nv7xj388f/48FotBZxA0Elit1r29vVKp1LExTJZlnudLpVI3F7GjTRqJRJaWlpaXl/P5PIZhxWLRZDJdu3atv7/fbDYfsXhZlgVBqFar1WoV9Ig69ASOgMlk6qbq+ZRhBobTcLP6TeUdjuOSyWQsFqtWq5qUpclkUtYNZWUcx6k/QZKkfD6fSqWq1eqxRw8cGYvFnj59+vXXXycSCcV0aDQamUymUChoINQEZSVJEkXxBN17rVaL5/lkMplIJEqlElRNlUqlRCKRTCZ5nj9i8Y1GI5/Pb21txWKx3d1dpRpHGQECTVmBQGBwcDAYDB7dw3DKljYEtNs7Y5vNpvrsYP+ZTAZaLNU2uc/nGx0dHRoagqylIAhra2urq6sHBweKRIUaFY7jNLZeO8Acxx0cHGxsbHz33XfPnz/f3NyEDKnaPpIkqb0BTFmt0nJwsjOp1+tKJ6lyaeCder1+2LKr1WosFpubm4Oe92w2KwiCKIqwKpgMAJUa/f39k5OTx3YknT43d/QvleY5NU6CIGiqD4xG48jIyB/+8IfJyUmKojAMEwTh66+/Bi9LDUa7Fmjnhv39/Y2NjaWlpfn5+fX19d3d3UqlovkrjUaAEwTVoFY9J24EgbAP6Ajl3oiiqHSXtXukqVTqzZs3s7Ozc3NzkUgkn89DJ2K7Pk4mk7u7uzzPOxyOo5vCTxPmI8yB9h9BvEmDHE3TQ0NDk5OTY2NjYIUWi8Xl5WWNRQrlwDD6ouPXCYIQj8efP3++sLCwuLiYSqWKxSKcbDv3q80CgiBIklTy5WoT8sRWcXtnQsdlQAjh7du3//nPf168ePH27dtMJsPzfMdfhtWCXxOPx5PJ5NFN4adv0B/Gze27gg0o8CuKGQoQoMMql8ttbW1By516t0aj0Wq1Go3Gjpp4c3Pzq6++gnkp+/v7EDrt6KdpDg5iF+rWbZ1OZzAYjEZj+3d1Hx7vCLNGvJVKpbm5uS+//PLFixfRaBQqoE8rb3vKMB8h2dp/pGCvPlO1dhEE4fvvvwcbVS3bCYJwOBw9PT1qSxWEYS6Xe/PmzdOnT0FQa+4HXCnN+apXCOFY9XdBh7fH4zlZsSKA2p6G0fBotVpdXFz861//Ojs7G4vFwPVoj48q/wJBUzjLsoFA4Oim8NPXzeoMD3Z4W03HI5NlWTFrQRy9fPkyEomoPS5g5f7+fnBI4K5AyUoymZydnf33v//9+vVrYAh1ogzDMJIkYcRRR0aB5i6N1oR5DYFAwGKxnCCsrTT3trO4cgL1ej0SifzrX/+an58HjDWaGAwumqaNRiM0oWlMsHA47PV6j4gJnj7M3VxeNdLKhsHL2traWllZAcvlxYsX33zzzd7entogIggC5mQMDAwomU0Q77Ozs19++eXCwkIqlarX60o9mpLwttlser0ejHaN8Q+ChCAItZ+j1+stFkswGAwEAicri+gY2VCfD6z822+/ffnyZTQaVWMMAFMUZbPZent7Q6EQ2FngU2kcKtja2QntYy+vwjqwLLWQ5Hl+cXGxXq+zLFuv17e2tra3tzmOU4NhMpnATOvp6VHGjQmCkEwmNzY2VldXd3d3FY4E8Ewmk8/nC4VCfX19mUxmfn4exkJo1glAqq+UTqeDgSEul+sEXZygR9QXDmurl6rValtbW6urq+/eveM4TjkKiH44nU6WZW/dujU2NgZxWcU5Ps/wSEeB3NnEJwiDwUCSpMaLhRA/TM5SPC5F8BIE0dvbe+/evZs3b5pMJuXTRFGsVCqZTObg4ECDscPhuH79+q1btz755BOj0fjs2bOlpaWORiJBEJpIDkmSHo8HxqGcQDE3m81KpVIoFBqNBvb/Jy0pwxo4jkskEhsbG/l8XrlhUIgxMDAwMTHxs5/97Pbt28Fg0G63t2vf8wl2KjtR28/tho9OpzObzW63G9JWyhWGMYAcx/E8j7VNoNLr9Q6HY2pq6uOPP+7p6dHIKJBjMM0DFkCSpMvlGh8fn56efvToEcuyu7u7s7OzHQ8FtB3Y/8oH0jTtdrt9Pt8J7C+QMdlsFgadqrcPlXEQ/4do4MHBgWIuwPeyLPvw4cPf/e53o6Ojaia+EJZ2s9kEGaWxvDQiBWBmWXZgYCAajWoqQTvqMxzHGYYJh8P3798fHx83m83qn1IU5fF4WJYNhUKNRoPjOJIk3W737du3Hzx48OjRo1AoRBBENpuFS9BuD4Lyrlarmo91OBx2ux2KWNRTFbqBGQYkZrNZdXMojuPgDUL8B8J56rgNwBwKhT777LM7d+6cSg/DacIM00fBT9UkMDThBZ1OZ7FYrl+/fvv27Wg0+u7dO40trRH4MIVubGzsF7/4xc9//nO3261mZTgXn883NTXVaDRYli0Wi0ajkWXZycnJ6elpMKBAJAJg7V9EkqTJZAIpok6hMgwDgeh6vS6KIkmSBoPBarUey16Q94xEIsViUZ2cJQjC6XR6vV5IT0mSpJhdiswD3eT3+09rludpwszzfCwWS6fTgiCoNQcM39a0XOA43t/f//jx42KxKMtyPB4HE1fj4+I4TlEUTCG6f//+b37zm8HBQeADjci12+1jY2MOh2N8fJzneaPR2NvbC3OJlBsG5l47zLBIq9UKSSS1uZDL5RYXF9++fVupVFqtls1mCwQCoVDI7/cfLckhBQn5FQVFZToYy7KKQFK7/uogzwlyYu8dZlmWDw4Otra20um0puvCaDS6XC5N0g1Odmxs7E9/+pPdbl9ZWdne3oaMm6IpKYqCWovR0dFwOPzgwYNQKNSxhAM4D5Q9y7JQJWg2mzXzEWRZBqe8XWhDTE0x/hWpu7i4uLOzI0kSz/NwmW7cuPHxxx9PT0/39/e3Xzh1bmZ/f393d7dWq6kvt8vlunHjBsuycEvAG1aLOlDq0Wg0EoncunWry0zrGcEsiuLOzk4sFiuVSmqOpGm6p6fH4/GoDWO16L59+7bH43nz5k0ikchms7VaTRRFYGIoLQoEAn6/PxQKud3uI5xXkIeg+Q6LsMLg8vZ0EwhSu92umX4ESfFoNKrIAJqm9/b2cBwPBALQ49kRAygoyGQyUKqgrn70er3Dw8NerxdMMJAiauEMeZ1YLPbs2bPh4eGJiYkfL7pPB2a4vJVKpVqtqhUzyCgA6bAUutFoDIVCHo+H4ziO4xQLDpCGWdNms7nLrR5tH0FFoibED3LF7/e73W6apjVpck3dkiiKyWQSShNrtdphE88BKkiBqCUHiByn06nUKxqNRofDAZ+jLKzZbOZyuVevXoETFQ6HNSbnOZtgmimNNE339/dPTEwEAoEjwgtwG8xms1rUa/yxU/ECyuVyexYEzP7BwUGn0wmPJAA3tz3ofdg7HW8bDLQzmUwQXlXuk9vtdjgccBogz1iW9fv96+vr6vS5KIrRaPTZs2eSJP32t78dHx+32WwnzpKdGsw4jjudzr6+PpfLBcWqFEUFAoE7d+6Mj4+7XK5jA8Lve8hQo9FIp9P5fL6dm20228DAgM/nGxoa2tnZAauwo5ygKMrr9cI2FV3eEWaTydTX1zc0NARfKsuy0WgMBAIjIyNqdUuSZF9fXzgcXllZgSC8wjOCIGxuboIE+uKLL+7evev3+0/WjYD/+c9/Pq2wF5RN1et1HMctFsvg4OBHH330y1/+8s6dOycucj7FuE2hUPj2229nZmbAZlYr5qGhoc8//3x0dLRYLObzeajvVGxjyBaAc9Xf33/37t2f/vSnYFIcxl5gEur1+mq12mg0wMQLhUJ3796dnp4Oh8OKpaLX6w0GgyRJyWQSBmKq1wxxtGw2m06nRVG0Wq0Wi0VdV4l1V9x/atxMkqTX67137x7DMPF4vFarORyOoaGhiYmJH1oQ+Z5g5jgun8+3O+hKqjEYDP76179uNBomkykSiYCxhuM4hI6dTifU3n700UfhcLi3t/foZAZJkqFQ6Fe/+pXX693b2+N5vre3d3BwcHJy0mKxqH/TZDJNTk5+8cUXUNGsVisQAM5kMoIglMvlnZ2dhw8fBoNB8FHNZjNUjBxb3HJqMEMYdmhoyOl03rx5U5ZlaE4BbYedN4Hpy/O8Wu8q3Az9XQaD4fr163/84x+DwSBU5QGvMAxjt9shHQnWYjfRR9C7o6OjXq93f38fwzCDwdDT02OxWDQHotfrvV7vo0ePIO62uLiYzWYV6Q0B4EKhsLy8DI+XATPC5XJ1We93yiYYjuNms5mmaY/Ho/i+F6fJTBRFqBBtXzYYSqBQR0ZGfD7f3t4e1P2DtQ9MY7FYlHngXeoyo9Ho9/uVAznsxhME0dPT8+jRIxDI8/PzkC1VB0x4nt/Z2clms8vLyxaLxeFwBIPBqampn/zkJ8dOID/9RCSU+GDnNFH4aJdPme+tXjC42ooxBT6P3W4H/aecndqJ+KFnclgURXPbenp6Pv30U3iq08rKSiaT0dShQvVgtVrN5/PpdBqqgLt5CMxZJCIvAjWbzUwmk8lk2kNgBEG0PwnqXBQNjuM+n++zzz6zWCz//Oc/X716FY/HwUTQVOMow2+7qfd7XzBfNFLyfYVCoX0oCvRaXpBhViRJ9vb2fvrpp2AHfPPNN+vr69lstmPB7/mERy4yzNVqNZ1Od+zSADO7m3amM+Nph8MxMTHR29s7PDz81VdfLS0tRSIRTQoELMdu6v2uEMy1Wg36oNptH7fbDYmEi7NgkDH9/f0Mw/T19T158uTVq1fb29vQkwBaxuFwhEKhqampmzdvHl3vd1VgxjCsXq+rOzzUMPf29h6WgThfpCGhAoGHkZGReDyeSqXAU7Db7R6PBx4Cc2y939WCub01DSLPEMq+mNNFlBJHj8cDMRZRFCmKgvTlOYRHLrjQhkR9u5kNML/vB67+SAK2Zhim3cfrMq9zVWDmeb49zAkpI4ZhPoiZsT/Gx9NfEZgP0800TcPsm8t9AlcFZiiLb/emSJJUOnQQzB88aVqE1dbs5X6I3dWCuWPXD/bfx59d+u1fFZiPGMZzFUh/RVi5+zEKCOYPm5s7DinQDEVBMH/YBEMC21n5jGdnIpjfI8HkqPa8BaYaHYRg/uBJEIRCodA+h0vp0UK6+TJoZZ7n8/m8euqBwsoMwxw9URHB/MHAXCgUEolEx2QzPLkSwfzBkyRJe3t7kUhEE+yELGRvb+/JBk4gmC8WcRy3traWSCTaS3ctFgvURCKYP3g/6uDgIBaLdVTMDoejr6/vKjy58pLDDFVgHMe1O80kSQaDwYGBgW6KqBHMF5ogkNk+cRPHcY/HMz4+HgwGr8Kzhi8/zDabbXBw0OPxgH8MvrLNZoORW263+ypEDoirAPPY2Nj09LQoint7e7IsMwxz48aN3//+92NjY1dBYmMYdvkfwSpJUjabXVxcnJ+f39zcbLVaPp/v3r1709PTfX19V+Tp8JcfZqgQKhaLe3t7+Xy+1WpBN/qPH52HYL5wSMNz3WDaHgwtviK5qSsEswL2JXuOK4IZ0VVyqBAhmBHMiBDMiBDMiBDMiBDMiBDMiBDMiBDMiBDMCGZECGZECGZECGZECGZECGZECGZECGZECGYEMyIEMyIEMyIEMyIEMyIEM6IT0v8AD5TF0YHzW0sAAAAASUVORK5CYII=';
    }

    if (!(layer.getSource() instanceof OlSourceTileWMS) &&
        !(layer.getSource() instanceof OlSourceImageWMS)) {
      return '404';
    }
    let baseUrl;
    if (layer.getSource().getUrls) {
      baseUrl = layer.getSource().getUrls()[0];
    } else {
      baseUrl = layer.getSource().getUrl();
    }

    const [minX, minY, maxX, maxY] = extent;
    const centerX = (minX + maxX) / 2.0;
    const centerY = (minY + maxY) / 2.0;
    const dy = maxY - minY;
    const calulatedQuadraticExtent = [
      centerX - dy / 2,
      centerY - dy / 2,
      centerX + dy / 2,
      centerY + dy / 2
    ];

    // TODO configurable!
    const baseParams =
      '?SERVICE=WMS&' +
      'VERSION=1.1.0&' +
      'REQUEST=GetMap&' +
      'FORMAT=image/png&' +
      'TRANSPARENT=true&' +
      'LAYERS=' + layer.getSource().getParams().LAYERS + '&' +
      'HEIGHT=128&' +
      'WIDTH=128&' +
      'SRS='+projection+'&' +
      'STYLES=&' +
      'BBOX=' + calulatedQuadraticExtent!.join(',');
    return baseUrl + baseParams;
  }

  /**
   *
   */
  onLoad() {
    this.setState({
      isLoading: false
    })
  }

  /**
   * The render function.
   */
  render() {
    const {
      layer,
      onClick,
      onMouseEnter,
      onMouseLeave
    } = this.props;

    const {
      isLoading
    } = this.state;

    if (!layer) {
      return null;
    }

    return (
      <div
        className={`layersetentry${layer!.getVisible() ? ' selected' : ''}`}
        onMouseLeave={onMouseLeave}
      >
        <div className="title-div">
          <b>{layer!.get('name')}</b>
          <div className="loading-div">
            <SimpleButton
              size="small"
              loading={isLoading}
            />
          </div>
        </div>
        <img
          data-identifier={layer.ol_uid}
          onClick={onClick}
          onLoad={this.onLoad}
          onMouseEnter={onMouseEnter}
          src={this.getLayerPreview(layer)}
          alt={layer!.get('name')}
        />
      </div>
    );
  }
}
export default LayerCarouselSlide;
